"use server";

import { z } from "zod";
import { prisma } from "./db";
import { getCurrentUser } from "./session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Helpers
const optStr = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));
const optNum = z
  .preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().optional()
  );
const reqNum = z.preprocess((v) => Number(v), z.number());
const reqDate = z.preprocess((v) => new Date(String(v)), z.date());
const optDate = z.preprocess(
  (v) => (v ? new Date(String(v)) : undefined),
  z.date().optional()
);

const dcSchema = z.object({
  title: z.string().min(3),
  location: z.string().min(2),
  country: z.string().default("USA"),
  totalCapacityMW: reqNum,
  availableMW: reqNum,
  availabilityDate: reqDate,
  ratePerKWh: optNum,
  pricingModel: z.enum(["per-kWh", "per-kW-month", "custom"]).default("per-kWh"),
  contractMinYears: optNum,
  tier: optStr,
  pue: optNum,
  coolingType: optStr,
  powerDensityKWPerRack: optNum,
  network: optStr,
  certifications: optStr,
  description: optStr,
});

const landSchema = z.object({
  title: z.string().min(3),
  location: z.string().min(2),
  country: z.string().default("USA"),
  acres: reqNum,
  availableMW: reqNum,
  utilityProvider: optStr,
  substationDistanceMiles: optNum,
  ppaStatus: optStr,
  ppaPricePerMWh: optNum,
  interconnectionStage: optStr,
  expectedEnergization: optDate,
  waterAvailable: optStr,
  waterSourceNotes: optStr,
  fiberAvailable: optStr,
  zoning: optStr,
  askingPrice: optNum,
  pricingModel: z.enum(["sale", "lease", "JV"]).default("sale"),
  description: optStr,
});

function fd(formData: FormData) {
  const data: Record<string, FormDataEntryValue | null> = {};
  for (const [k, v] of formData.entries()) data[k] = v;
  return data;
}

export async function createDcListing(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  const parsed = dcSchema.safeParse(fd(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  const listing = await prisma.dataCenterListing.create({
    data: { ...parsed.data, ownerId: user.id },
  });

  revalidatePath("/listings/dc");
  redirect(`/listings/dc/${listing.id}`);
}

export async function createLandListing(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  const parsed = landSchema.safeParse(fd(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  const listing = await prisma.poweredLandListing.create({
    data: { ...parsed.data, ownerId: user.id },
  });

  revalidatePath("/listings/land");
  redirect(`/listings/land/${listing.id}`);
}

export async function deleteDcListing(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");
  const listing = await prisma.dataCenterListing.findUnique({ where: { id } });
  if (!listing || listing.ownerId !== user.id) return { error: "Not allowed" };
  await prisma.dataCenterListing.delete({ where: { id } });
  revalidatePath("/listings/dc");
  revalidatePath("/dashboard");
}

export async function deleteLandListing(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");
  const listing = await prisma.poweredLandListing.findUnique({ where: { id } });
  if (!listing || listing.ownerId !== user.id) return { error: "Not allowed" };
  await prisma.poweredLandListing.delete({ where: { id } });
  revalidatePath("/listings/land");
  revalidatePath("/dashboard");
}

// Q&A
export async function askQuestion(
  listingType: "dc" | "land",
  listingId: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");
  const body = String(formData.get("body") || "").trim();
  if (body.length < 3) return { error: "Question is too short" };

  await prisma.question.create({
    data: {
      body,
      askerId: user.id,
      ...(listingType === "dc"
        ? { dcListingId: listingId }
        : { landListingId: listingId }),
    },
  });
  revalidatePath(`/listings/${listingType}/${listingId}`);
}

export async function answerQuestion(
  listingType: "dc" | "land",
  listingId: string,
  questionId: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");
  const body = String(formData.get("body") || "").trim();
  if (body.length < 1) return { error: "Answer cannot be empty" };

  await prisma.answer.create({
    data: { body, questionId, responderId: user.id },
  });
  revalidatePath(`/listings/${listingType}/${listingId}`);
}
