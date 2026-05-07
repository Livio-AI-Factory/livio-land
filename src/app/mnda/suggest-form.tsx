"use client";

// Counterparty redline form — sits below the MNDA on the signing page.
// Posts the proposed edit to every admin via the existing Message table
// (see submitMndaSuggestion in src/lib/mnda-actions.ts). No schema change.
//
// Why redlining matters for this product: most off-takers want their
// counsel to mark up an NDA before signing. Without an in-app way to
// suggest changes they'd email Ethan directly and lose context — this
// keeps the suggestion attached to their account so future signing
// flows can show "you previously asked us to change Section 3."

import { useState, useTransition } from "react";
import { submitMndaSuggestion } from "@/lib/mnda-actions";

export function MndaSuggestForm() {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { kind: "idle" } | { kind: "ok" } | { kind: "err"; msg: string }
  >({ kind: "idle" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setResult({ kind: "idle" });
    const fd = new FormData();
    fd.set("body", text);
    startTransition(async () => {
      const r = await submitMndaSuggestion(fd);
      if (r.ok) {
        setResult({ kind: "ok" });
        setText(""); // clear so they don't accidentally re-submit
      } else {
        setResult({ kind: "err", msg: r.error });
      }
    });
  };

  return (
    <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/40 p-5">
      <h2 className="text-base font-semibold text-slate-900">
        Want to redline or suggest changes?
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Download the MNDA above as a .txt file, mark it up in Word / Google Docs
        with your edits, and paste your proposed changes (or a summary) here.
        We&apos;ll route your note to the Livio team. You don&apos;t have to sign
        until we agree on the language.
      </p>
      <form onSubmit={onSubmit} className="mt-4">
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1.5">
          Your proposed changes
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={
            "e.g. In Section 3, please change the survival period from 3 years to 2 years.\n\nOr paste the full redlined text here."
          }
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          disabled={pending}
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send to Livio team"}
          </button>
          {result.kind === "ok" && (
            <span className="text-sm text-emerald-700">
              ✓ Got it. We&apos;ll review and reply by email or in your inbox.
            </span>
          )}
          {result.kind === "err" && (
            <span className="text-sm text-red-700">{result.msg}</span>
          )}
        </div>
      </form>
    </div>
  );
}
