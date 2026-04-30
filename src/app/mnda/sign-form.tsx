"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signMnda } from "@/lib/mnda-actions";

type Props = {
  defaultName: string;
  defaultCompany: string;
  defaultEmail: string;
  nextUrl: string;
};

export function MndaSignForm({ defaultName, defaultCompany, defaultEmail, nextUrl }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [accepted, setAccepted] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signMnda(fd);
      if (result.ok) {
        router.push(nextUrl || "/");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const confirmIsValid = confirmation.trim().toUpperCase() === "I AGREE";
  const canSubmit = accepted && confirmIsValid && !pending;

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Sign electronically</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter your full legal name and company. Your typed name, IP address, timestamp, and the
        agreement version will be recorded as your e-signature under U.S. ESIGN/UETA.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
            Full legal name *
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            defaultValue={defaultName}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-700">
            Company / counterparty *
          </label>
          <input
            id="company"
            name="company"
            required
            defaultValue={defaultCompany}
            placeholder="e.g. Acme AI Labs"
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Your title (optional)
          </label>
          <input
            id="title"
            name="title"
            placeholder="e.g. Head of Infrastructure"
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Account email</label>
          <input
            disabled
            value={defaultEmail}
            className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3">
        <input
          id="acceptedTerms"
          name="acceptedTerms"
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
        />
        <label htmlFor="acceptedTerms" className="text-sm text-slate-700 leading-snug">
          I have read the entire agreement above and have authority to bind my organization to it.
          I understand that the non-circumvention clause survives for 4 years after any contact
          introduction made through Livio Land, and that the penalty for circumventing the platform
          is the commission Livio would have earned on the deal.
        </label>
      </div>

      <div className="mt-4">
        <label htmlFor="typedConfirmation" className="block text-sm font-medium text-slate-700">
          Type <span className="font-mono text-brand-700">I AGREE</span> to confirm your signature *
        </label>
        <input
          id="typedConfirmation"
          name="typedConfirmation"
          autoComplete="off"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-mono shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          By signing, you authorize Livio to send a copy of the executed agreement to your account
          email.
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Signing…" : "Sign and continue →"}
        </button>
      </div>
    </form>
  );
}
