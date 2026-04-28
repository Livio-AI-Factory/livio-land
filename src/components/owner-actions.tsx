"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteDcListing, deleteLandListing } from "@/lib/listing-actions";

export function OwnerActions({
  listingType,
  listingId,
  isAdmin,
}: {
  listingType: "dc" | "land";
  listingId: string;
  isAdmin?: boolean;
}) {
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    const label = isAdmin
      ? "Permanently delete this listing? (admin action)"
      : "Permanently delete this listing? This cannot be undone.";
    if (!confirm(label)) return;
    setPending(true);
    if (listingType === "dc") await deleteDcListing(listingId);
    else await deleteLandListing(listingId);
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/listings/${listingType}/${listingId}/edit`}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-500"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Deleting..." : isAdmin ? "Delete (admin)" : "Delete"}
      </button>
    </div>
  );
}
