"use client";

import { useState } from "react";
import Link from "next/link";
import { sendMessage } from "@/lib/listing-actions";

export function MessageForm({
  listingType,
  listingId,
  ownerName,
  isSignedIn,
  isOwner,
}: {
  listingType: "dc" | "land";
  listingId: string;
  ownerName: string;
  isSignedIn: boolean;
  isOwner: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [draft, setDraft] = useState("");

  if (isOwner) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Connect</h2>
        <p className="mt-2 text-sm text-slate-600">
          This is your listing. Off-takers will reach you here.{" "}
          <Link href="/inbox" className="text-brand-600 hover:underline">
            View your inbox →
          </Link>
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Connect with {ownerName}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          <Link href="/auth/signin" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>{" "}
          or{" "}
          <Link href="/auth/signup" className="text-brand-600 font-medium hover:underline">
            create an account
          </Link>{" "}
          to send a private message about this listing.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Connect with {ownerName}
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Send a private message. We'll email {ownerName} that you reached out.
      </p>
      {sent ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Message sent. {ownerName} will see it in their inbox and via email.{" "}
          <button
            className="ml-2 text-emerald-900 underline"
            onClick={() => {
              setSent(false);
              setDraft("");
            }}
          >
            Send another
          </button>
        </div>
      ) : (
        <form
          action={async (formData) => {
            setPending(true);
            setError(null);
            try {
              const res = await sendMessage(listingType, listingId, formData);
              if (res && "error" in res && res.error) {
                setError(res.error);
              } else if (res && "ok" in res && res.ok) {
                setSent(true);
              }
            } finally {
              setPending(false);
            }
          }}
          className="mt-4 space-y-3"
        >
          <textarea
            name="body"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            required
            placeholder="Hi — interested in 30 MW for our AI training cluster. Could we talk timing and what specs you'd need?"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{draft.length}/4000 characters</span>
            <button
              type="submit"
              disabled={pending || draft.trim().length < 5}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {pending ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
