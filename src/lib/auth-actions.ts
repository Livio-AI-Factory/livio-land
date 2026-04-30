"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "./db";
import { getSession } from "./session";
import { redirect } from "next/navigation";
import { MNDA_VERSION } from "@/content/mnda";

// Normalize emails to lowercase so casing differences (Ethan@x.com vs
// ethan@x.com) never block a sign-in. Applied on both signup and signin.
const emailField = z
  .string()
  .email()
  .transform((s) => s.trim().toLowerCase());

const signupSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  role: z.enum(["supplier", "offtaker", "both"]).default("both"),
  mndaAccepted: z.literal("1", {
    errorMap: () => ({ message: "You must accept the MNDA to create an account" }),
  }),
});

const signinSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    company: formData.get("company"),
    role: formData.get("role") || "both",
    mndaAccepted: formData.get("mndaAccepted"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "An account with that email already exists" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Capture client metadata for the MNDA signature audit trail.
  const headerBag = await headers();
  const forwardedFor = headerBag.get("x-forwarded-for");
  const realIp = headerBag.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
  const userAgent = headerBag.get("user-agent") || null;
  const now = new Date();

  // Create the user AND their MNDA signature in a single transaction so
  // signup is atomic — either both succeed or neither does.
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      company: parsed.data.company,
      role: parsed.data.role,
      mndaSignedAt: now,
      mndaSignedVersion: MNDA_VERSION,
      mndaSignatures: {
        create: {
          fullName: parsed.data.name,
          company: parsed.data.company,
          ipAddress,
          userAgent,
          mndaVersion: MNDA_VERSION,
          signedAt: now,
        },
      },
    },
  });

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  await session.save();

  // Honor the ?next= URL if the user was bounced here from a gated page.
  const next = (formData.get("next") as string | null)?.trim();
  redirect(next && next.startsWith("/") ? next : "/dashboard");
}

export async function signin(formData: FormData) {
  const parsed = signinSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return { error: "Invalid email or password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  await session.save();

  // Honor ?next= so the user lands back on the page they were trying to reach
  // (e.g. /listings/dc → MNDA gate → signin → back to /listings/dc).
  const next = (formData.get("next") as string | null)?.trim();
  redirect(next && next.startsWith("/") ? next : "/dashboard");
}

export async function signout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
