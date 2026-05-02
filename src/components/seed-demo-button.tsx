"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { seedDemoLandListings } from "@/lib/admin-actions";

/**
 * Admin-only "Seed demo listings" button. Calls the server action that
 * creates 6 realistic demo land listings (Pinal AZ, Tom Green TX, Loudoun
 * VA, Sweetwater WY, Fayette IA, Yakima WA) owned by demo seller accounts.
 * Idempotent — clicking again does nothing if the listings already exist.
 */
export function SeedDemoButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { kind: "idle" } | { kind: "ok"; created: number } | { kind: "err"; msg: string }
  >({ kind: "idle" });

  const onClick = () => {
    setResult({ kind: "idle" });
    startTransition(async () => {
      const r = await seedDemoLandListings();
      if (r.ok) {
        setResult({ kind: "ok", created: r.created });
        router.refresh();
      } else {
        setResult({ kind: "err", msg: r.error });
      }
    });
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="font-semibold">Seed demo land listings</strong> — populate the
          marketplace with 6 realistic AZ / TX / VA / WY / IA / WA sites so AI Data Center
          buyers see supply right away. Idempotent.
        </div>
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {pending ? "Seeding…" : "Seed 6 demo sites"}
        </button>
      </div>
      {result.kind === "ok" && (
        <div className="mt-2 text-xs text-emerald-800">
          ✓ {result.created === 0 ? "Already seeded — nothing new to add." : `Created ${result.created} new demo listing${result.created === 1 ? "" : "s"}.`}
        </div>
      )}
      {result.kind === "err" && (
        <div className="mt-2 text-xs text-red-700">Error: {result.msg}</div>
      )}
    </div>
  );
}
