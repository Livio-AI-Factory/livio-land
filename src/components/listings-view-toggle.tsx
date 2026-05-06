"use client";

// Grid ↔ Map view toggle for /listings/land. Stays in sync with the URL
// (?view=grid|map) so the choice survives page reloads and is shareable.
// Persisted preference also writes to localStorage so a return visit defaults
// to whatever the buyer last picked.

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type View = "grid" | "map";

export function ListingsViewToggle({ current }: { current: View }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Persist current selection so a return visit lands in the same view.
  useEffect(() => {
    try {
      window.localStorage.setItem("livio.listings.view", current);
    } catch {
      // Ignore — privacy mode, quota, etc.
    }
  }, [current]);

  const setView = (next: View) => {
    if (next === current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === "grid") {
      params.delete("view"); // grid is the default — keep URL clean
    } else {
      params.set("view", next);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="inline-flex rounded-full border border-neutral-300 bg-white p-1 text-[13px]">
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-pressed={current === "grid"}
        className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
          current === "grid"
            ? "bg-emerald-700 text-white"
            : "text-neutral-700 hover:text-emerald-700"
        }`}
      >
        Grid
      </button>
      <button
        type="button"
        onClick={() => setView("map")}
        aria-pressed={current === "map"}
        className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
          current === "map"
            ? "bg-emerald-700 text-white"
            : "text-neutral-700 hover:text-emerald-700"
        }`}
      >
        Map
      </button>
    </div>
  );
}
