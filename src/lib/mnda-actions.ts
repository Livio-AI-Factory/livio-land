"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MNDA_VERSION } from "@/content/mnda";

export type MndaSignResult = { ok: true } | { ok: false; error: string };

/**
 * Server action: record an MNDA signature for the current user.
 * The user must be logged in. Returns { ok } on success or surfaces a validation error.
 */
export async function signMnda(formData: FormData): Promise<MndaSignResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in to sign the MNDA." };

  const fullName = (formData.get("fullName") as string | null)?.trim() ?? "";
  const company = (formData.get("company") as string | null)?.trim() ?? "";
  const title = (formData.get("title") as string | null)?.trim() || null;
  const acceptedTerms = formData.get("acceptedTerms");
  const typedConfirmation = (formData.get("typedConfirmation") as string | null)?.trim() ?? "";

  if (!fullName) return { ok: false, error: "Full legal name is required." };
  if (fullName.length < 3) return { ok: false, error: "Please enter your full legal name." };
  if (!company) return { ok: false, error: "Company name is required." };
  if (acceptedTerms !== "on") return { ok: false, error: "You must check the agreement box." };
  if (typedConfirmation.toUpperCase() !== "I AGREE") {
    return { ok: false, error: 'Type "I AGREE" exactly to confirm your signature.' };
  }

  const headerBag = await headers();
  const forwardedFor = headerBag.get("x-forwarded-for");
  const realIp = headerBag.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
  const userAgent = headerBag.get("user-agent") || null;

  // Persist the signature row, then update the User's denormalised pointer.
  await prisma.$transaction([
    prisma.mndaSignature.create({
      data: {
        userId: user.id,
        fullName,
        company,
        title,
        ipAddress,
        userAgent,
        mndaVersion: MNDA_VERSION,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        mndaSignedAt: new Date(),
        mndaSignedVersion: MNDA_VERSION,
        // Also keep the company on the User row up to date if it was empty.
        ...(user.company ? {} : { company }),
      },
    }),
  ]);

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Returns true if the current user has signed the latest MNDA version. */
export async function hasSignedCurrentMnda(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { mndaSignedVersion: true, isAdmin: true },
  });
  if (!dbUser) return false;
  // Admins are exempt from the gate so they can manage the platform.
  if (dbUser.isAdmin) return true;
  return dbUser.mndaSignedVersion === MNDA_VERSION;
}

/** Helper: route guard. Call from server components/pages that should be gated.
 * Preserves the user's intended destination by reading x-pathname (set by the
 * middleware) and passing it to /mnda?next=… so they land back on the page
 * they were trying to reach instead of the homepage after signing.
 */
export async function requireSignedMnda() {
  const signed = await hasSignedCurrentMnda();
  if (signed) return;
  const headerBag = await headers();
  const path = headerBag.get("x-pathname") || "/";
  redirect(`/mnda?next=${encodeURIComponent(path)}`);
}
