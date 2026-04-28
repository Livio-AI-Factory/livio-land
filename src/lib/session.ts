import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  email?: string;
  name?: string;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_PASSWORD ||
    "dev-only-change-me-in-production-min-32-chars-long",
  cookieName: "livio-land-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return {
    id: session.userId,
    email: session.email!,
    name: session.name!,
  };
}
