"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { isR2Configured, makePhotoKey, uploadToR2, deleteFromR2, getR2DownloadUrl } from "@/lib/r2";

export type ListingPhotoWithUrl = {
  id: string;
  url: string;
  caption: string | null;
  kind: string;
  originalName: string;
};

/** Fetch photos for a listing and presign their URLs. Server-only. */
export async function getListingPhotos(
  type: "dc" | "land",
  listingId: string,
): Promise<ListingPhotoWithUrl[]> {
  if (!isR2Configured()) return [];
  const photos = await prisma.listingPhoto.findMany({
    where: type === "dc" ? { dcListingId: listingId } : { landListingId: listingId },
    orderBy: [{ sortOrder: "asc" }, { uploadedAt: "asc" }],
  });
  return Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      url: await getR2DownloadUrl(p.r2Key),
      caption: p.caption,
      kind: p.kind,
      originalName: p.originalName,
    })),
  );
}

export type PhotoActionResult =
  | { ok: true; photoId: string }
  | { ok: false; error: string };

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "application/pdf", // For document uploads
]);
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

async function ownsListing(
  type: "dc" | "land",
  listingId: string,
  userId: string,
  isAdmin: boolean,
): Promise<boolean> {
  if (isAdmin) return true;
  const listing =
    type === "dc"
      ? await prisma.dataCenterListing.findUnique({
          where: { id: listingId },
          select: { ownerId: true },
        })
      : await prisma.poweredLandListing.findUnique({
          where: { id: listingId },
          select: { ownerId: true },
        });
  return listing?.ownerId === userId;
}

export async function uploadListingPhoto(formData: FormData): Promise<PhotoActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  if (!isR2Configured())
    return { ok: false, error: "Photo storage is not configured. Contact an admin." };

  const type = formData.get("type") as "dc" | "land" | null;
  const listingId = formData.get("listingId") as string | null;
  const file = formData.get("file") as File | null;
  const caption = ((formData.get("caption") as string | null) || "").trim() || null;
  const kind = ((formData.get("kind") as string | null) || "photo").trim();

  if (!type || (type !== "dc" && type !== "land")) return { ok: false, error: "Invalid type." };
  if (!listingId) return { ok: false, error: "Missing listing." };
  if (!file) return { ok: false, error: "No file uploaded." };
  if (!ALLOWED_IMAGE_TYPES.has(file.type))
    return { ok: false, error: `Unsupported file type: ${file.type}` };
  if (file.size > MAX_BYTES)
    return { ok: false, error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB).` };

  if (!(await ownsListing(type, listingId, user.id, user.isAdmin))) {
    return { ok: false, error: "You can only upload photos to your own listings." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = makePhotoKey({
    listingType: type,
    listingId,
    originalName: file.name || "upload",
  });
  await uploadToR2(key, buffer, file.type);

  // Determine sortOrder = current count.
  const existing = await prisma.listingPhoto.count({
    where: type === "dc" ? { dcListingId: listingId } : { landListingId: listingId },
  });

  const photo = await prisma.listingPhoto.create({
    data: {
      r2Key: key,
      originalName: file.name || "upload",
      contentType: file.type,
      sizeBytes: file.size,
      kind,
      caption,
      sortOrder: existing,
      ...(type === "dc" ? { dcListingId: listingId } : { landListingId: listingId }),
    },
  });

  revalidatePath(`/listings/${type}/${listingId}`);
  return { ok: true, photoId: photo.id };
}

export async function deleteListingPhoto(photoId: string): Promise<PhotoActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const photo = await prisma.listingPhoto.findUnique({
    where: { id: photoId },
    select: { id: true, r2Key: true, dcListingId: true, landListingId: true },
  });
  if (!photo) return { ok: false, error: "Photo not found." };

  const type: "dc" | "land" = photo.dcListingId ? "dc" : "land";
  const listingId = photo.dcListingId || photo.landListingId;
  if (!listingId) return { ok: false, error: "Photo not linked to a listing." };
  if (!(await ownsListing(type, listingId, user.id, user.isAdmin))) {
    return { ok: false, error: "Not authorized to delete this photo." };
  }

  // Delete from R2 first (best-effort), then from the DB.
  try {
    await deleteFromR2(photo.r2Key);
  } catch (e) {
    // Log but proceed — orphan in R2 is recoverable, orphan in DB pointing nowhere is worse.
    console.error("R2 delete failed for", photo.r2Key, e);
  }
  await prisma.listingPhoto.delete({ where: { id: photo.id } });
  revalidatePath(`/listings/${type}/${listingId}`);
  return { ok: true, photoId };
}
