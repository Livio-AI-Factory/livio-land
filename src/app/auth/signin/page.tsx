import Link from "next/link";
import { redirect } from "next/navigation";
import { signin } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/session";
import { SigninForm } from "./signin-form";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SigninPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params?.next;

  // Already signed in? Skip the form, send them where they were going.
  const user = await getCurrentUser();
  if (user) redirect(next || "/dashboard");

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-2 text-slate-600">Sign in to manage your listings.</p>
      <div className="mt-8">
        <SigninForm action={signin} />
      </div>
      <p className="mt-6 text-sm text-slate-600">
        New here?{" "}
        <Link
          href={`/auth/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-brand-600 font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
