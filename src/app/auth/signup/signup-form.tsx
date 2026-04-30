"use client";

import { useState } from "react";
import {
  MNDA_TITLE,
  MNDA_INTRO,
  MNDA_SECTIONS,
  MNDA_VERSION,
  MNDA_DISCLOSING_PARTY,
} from "@/content/mnda";

type SignupResult = { error?: string } | void;

export function SignupForm({
  action,
  nextUrl,
}: {
  action: (formData: FormData) => Promise<SignupResult>;
  nextUrl?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const confirmIsValid = confirmation.trim().toUpperCase() === "I AGREE";
  const canSubmit = accepted && confirmIsValid && !pending;

  return (
    <form
      action={async (formData) => {
        if (!accepted || !confirmIsValid) {
          setError(
            "You must read the MNDA, check the agreement box, and type 'I AGREE' to create an account.",
          );
          return;
        }
        if (nextUrl) formData.set("next", nextUrl);
        formData.set("mndaAccepted", "1");
        formData.set("mndaVersion", MNDA_VERSION);
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
      <Field label="Full legal name" name="name" required />
      <Field label="Work email" name="email" type="email" required />
      <Field label="Company / counterparty" name="company" required />
      <Field
        label="Password"
        name="password"
        type="password"
        required
        helper="At least 8 characters"
      />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          I'm primarily here to...
        </label>
        <select
          name="role"
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          defaultValue="both"
        >
          <option value="supplier">List capacity / land (supplier)</option>
          <option value="offtaker">Search for capacity / land (off-taker)</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* Mutual NDA + Non-Circumvention agreement, required to sign up. */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Mutual NDA &amp; Non-Circumvention Agreement
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Required before you can browse listings or contact suppliers. Your typed name + IP +
              timestamp are recorded as your e-signature.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAgreement((v) => !v)}
            className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-400"
          >
            {showAgreement ? "Hide" : "Read agreement"}
          </button>
        </div>

        {showAgreement && (
          <div className="mt-3 max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-700">
            <p className="font-semibold text-slate-900">{MNDA_TITLE}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Version {MNDA_VERSION} · Between you and {MNDA_DISCLOSING_PARTY.name}
            </p>
            <p className="mt-3 whitespace-pre-line">{MNDA_INTRO}</p>
            {MNDA_SECTIONS.map((s) => (
              <section key={s.heading} className="mt-3">
                <p className="font-semibold text-slate-900">{s.heading}</p>
                <p className="mt-1 whitespace-pre-line">{s.body}</p>
              </section>
            ))}
            <p className="mt-3 border-t border-slate-200 pt-2 font-semibold text-slate-900">
              Signed for Livio Building Systems, Inc.: {MNDA_DISCLOSING_PARTY.signer},{" "}
              {MNDA_DISCLOSING_PARTY.title}
            </p>
          </div>
        )}

        <div className="mt-3 flex items-start gap-3">
          <input
            id="accepted"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
          />
          <label htmlFor="accepted" className="text-xs text-slate-700 leading-snug">
            I have read the MNDA &amp; Non-Circumvention Agreement above and have authority to bind
            my organization to it. I understand the non-circumvention clause survives 4 years from
            any contact introduction made through Livio Land, and that the penalty for
            circumventing the platform is the commission Livio would have earned on the deal.
          </label>
        </div>

        <div className="mt-3">
          <label htmlFor="confirmation" className="block text-xs font-medium text-slate-700">
            Type <span className="font-mono text-brand-700">I AGREE</span> to confirm your
            e-signature
          </label>
          <input
            id="confirmation"
            autoComplete="off"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account & sign MNDA"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  helper,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  helper?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}
