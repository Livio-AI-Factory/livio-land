import Link from "next/link";
import { signup } from "@/lib/auth-actions";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-2 text-slate-600">
        List capacity, post powered land, or search for sites — Livio Land
        connects sellers and off-takers.
      </p>
      <div className="mt-8">
        <SignupForm action={signup} />
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
