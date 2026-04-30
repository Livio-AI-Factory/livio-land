"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { approveListing, rejectListing } from "@/lib/admin-actions";

type Props = {
  type: "dc" | "land";
  id: string;
  title: string;
  location: string;
  ownerName: string;
  ownerEmail: string;
  ownerCompany: string;
  createdAt: string;
  summary: string;
  description: string;
};

export function AdminListingRow(props: Props) {
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onApprove = () => {
    setError(null);
    startTransition(async () => {
      const r = await approveListing(props.type, props.id);
      if (!r.ok) setError(r.error);
    });
  };

  const onReject = () => {
    setError(null);
    if (!reason.trim()) {
      setError("Please give a reason so the supplier knows what to fix.");
      return;
    }
    startTransition(async () => {
      const r = await rejectListing(props.type, props.id, reason);
      if (!r.ok) setError(r.error);
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/listings/${props.type}/${props.id}`}
              className="font-semibold text-slate-900 hover:text-brand-700 hover:underline"
            >
              {props.title}
            </Link>
            <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5">
              Pending review
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-600">{props.location}</div>
          <div className="mt-1 text-xs text-slate-500">
            {props.summary} · Listed by{" "}
            <span className="font-medium text-slate-700">
              {props.ownerCompany || props.ownerName}
            </span>{" "}
            ({props.ownerEmail}) ·{" "}
            {new Date(props.createdAt).toLocaleDateString()}
          </div>
          {props.description && (
            <p className="mt-2 text-sm text-slate-700 max-w-2xl">{props.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={pending}
            onClick={onApprove}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {pending ? "Working…" : "Approve"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setShowReject((v) => !v)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>

      {showReject && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <label className="block text-sm font-medium text-slate-700">Rejection reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Need utility LOI to verify capacity claim. Resubmit with that attached."
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            rows={3}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReject(false)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={onReject}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "Working…" : "Reject and notify supplier"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
