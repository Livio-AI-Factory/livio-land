import Link from "next/link";
import { redirect } from "next/navigation";
import { signup } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/session";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params?.next;

  // Already signed in? Don't show the signup form — bounce them where they were going.
  const user = await getCurrentUser();
  if (user) redirect(next || "/dashboard");

  return (
    <div className="mx-auto max-w-2xl py-16 px-4">
      <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-2 text-slate-600">
        List capacity, post powered land, or search for sites — Livio Land
        connects sellers and off-takers.
      </p>
      <div className="mt-8">
        <SignupForm action={signup} nextUrl={next} />
      </div>
      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-brand-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
