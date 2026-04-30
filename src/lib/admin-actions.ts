"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  if (!user.isAdmin) throw new Error("Admin access required");
  return user;
}

export async function approveListing(
  type: "dc" | "land",
  listingId: string,
): Promise<AdminActionResult> {
  try {
    const admin = await requireAdmin();
    const data = {
      approvalStatus: "approved",
      approvedAt: new Date(),
      approvedById: admin.id,
      rejectionReason: null,
    };
    if (type === "dc") {
      await prisma.dataCenterListing.update({ where: { id: listingId }, data });
    } else {
      await prisma.poweredLandListing.update({ where: { id: listingId }, data });
    }
    revalidatePath("/admin");
    revalidatePath(`/listings/${type}`);
    revalidatePath(`/listings/${type}/${listingId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to approve" };
  }
}

export async function rejectListing(
  type: "dc" | "land",
  listingId: string,
  reason: string,
): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    const trimmed = reason.trim();
    if (!trimmed) return { ok: false, error: "Rejection reason is required." };
    const data = {
      approvalStatus: "rejected",
      approvedAt: null,
      approvedById: null,
      rejectionReason: trimmed,
    };
    if (type === "dc") {
      await prisma.dataCenterListing.update({ where: { id: listingId }, data });
    } else {
      await prisma.poweredLandListing.update({ where: { id: listingId }, data });
    }
    revalidatePath("/admin");
    revalidatePath(`/listings/${type}`);
    revalidatePath(`/listings/${type}/${listingId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to reject" };
  }
}

/** Toggle a user's admin status. Used to bootstrap Nav + Ethan as admins. */
export async function setUserAdmin(email: string, isAdmin: boolean): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await prisma.user.update({ where: { email }, data: { isAdmin } });
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update user" };
  }
}
