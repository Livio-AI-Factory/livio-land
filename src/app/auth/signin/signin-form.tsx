"use client";

import { useState } from "react";

export function SigninForm({
  action,
  nextUrl,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  nextUrl?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        setPending(true);
        setError(null);
        try {
          const result = await action(formData);
          if (result && "error" in result && result.error) setError(result.error);
        } finally {
          setPending(false);
        }
      }}
      className="space-y-4"
    >
      {nextUrl && <input type="hidden" name="next" value={nextUrl} />}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input
          type="password"
          name="password"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
