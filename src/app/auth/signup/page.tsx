import Link from "next/link";
import { redirect } from "next/navigation";
import { signup } from "@/lib/auth-actions";
import { getCurrentUser, getSession } from "@/lib/session";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ next?: string; from?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params?.next;
  const fromList = params?.from === "list";

  // Already signed in? Don't show the signup form — bounce them where they were going.
  const user = await getCurrentUser();
  if (user) redirect(next || "/dashboard");

  // If they just came from /list and we have a draft in session, show a
  // contextual banner. Materialization happens inside the signup action
  // after the user is created.
  const session = await getSession();
  const pending = session.pendingLandListing;

  return (
    <div className="mx-auto max-w-2xl py-16 px-4">
      {fromList && pending ? (
        <div className="mb-6 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            <span>Last step</span>
            <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-emerald-900">
              Step 3 of 3
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Almost there — create your account to save{" "}
            <span className="text-emerald-700">&quot;{pending.title}&quot;</span>
          </h2>
          <p className="mt-1 text-sm text-slate-700">
            We've stashed your site details. Sign up below and we'll attach the
            listing to your new account, send it to admin review, and email you
            the moment an AI Data Center buyer reaches out.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Signing up signs Livio's Mutual NDA + non-circumvention agreement
            (the &quot;I agree to the MNDA&quot; checkbox below). The 2% seller-side
            success fee in the agreement only applies on a deal that actually
            closes.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-slate-600">
            List capacity, post powered land, or search for sites — Livio Land
            connects sellers and off-takers.
          </p>
        </>
      )}

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
