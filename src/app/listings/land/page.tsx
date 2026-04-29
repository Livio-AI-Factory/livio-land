import Link from "next/link";
import { prisma } from "@/lib/db";
import { SearchBar } from "@/components/search-bar";
import { Prisma } from "@prisma/client";

interface Props {
  searchParams: {
    q?: string;
    minMW?: string;
    maxMW?: string;
    minAcres?: string;
    state?: string;
    interconnection?: string;
    ppa?: string;
    deal?: string;
    water?: string;
    fiber?: string;
    maxPrice?: string;
    sort?: string;
  };
}

export default async function LandListingsPage({ searchParams }: Props) {
  const f = searchParams;
  const where: Prisma.PoweredLandListingWhereInput = { status: "available" };
  if (f.q) {
    where.OR = [
      { title: { contains: f.q } },
      { location: { contains: f.q } },
      { description: { contains: f.q } },
      { county: { contains: f.q } },
      { state: { contains: f.q } },
    ];
  }
  if (f.minMW) where.availableMW = { ...((where.availableMW as object) || {}), gte: Number(f.minMW) };
  if (f.maxMW) where.availableMW = { ...((where.availableMW as object) || {}), lte: Number(f.maxMW) };
  if (f.minAcres) where.acres = { gte: Number(f.minAcres) };
  if (f.state) where.state = f.state;
  if (f.interconnection) where.interconnectionStage = f.interconnection;
  if (f.ppa) where.ppaStatus = f.ppa;
  if (f.deal) where.pricingModel = f.deal;
  if (f.water) where.waterAvailable = f.water;
  if (f.fiber) where.fiberAvailable = f.fiber;
  if (f.maxPrice) where.askingPrice = { lte: Number(f.maxPrice) };

  let orderBy: Prisma.PoweredLandListingOrderByWithRelationInput = { createdAt: "desc" };
  if (f.sort === "mw-desc") orderBy = { availableMW: "desc" };
  else if (f.sort === "mw-asc") orderBy = { availableMW: "asc" };
  else if (f.sort === "price-asc") orderBy = { askingPrice: "asc" };
  else if (f.sort === "price-desc") orderBy = { askingPrice: "desc" };
  else if (f.sort === "acres-desc") orderBy = { acres: "desc" };

  const listings = await prisma.poweredLandListing.findMany({
    where,
    orderBy,
    include: { owner: { select: { name: true, company: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Powered Land</h1>
          <p className="mt-1 text-sm text-slate-600">
            {listings.length} {listings.length === 1 ? "listing" : "listings"} · {Math.round(listings.reduce((s,l)=>s+l.availableMW,0))} MW total
          </p>
        </div>
        <Link
          href="/listings/new/land"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
        >
          + List land
        </Link>
      </div>

      <div className="mt-6">
        <SearchBar
          basePath="/listings/land"
          fields={[
            { name: "q", label: "Keyword / location / county", type: "text", placeholder: "ERCOT, Taylor County, MISO..." },
            { name: "minMW", label: "Min MW", type: "number", placeholder: "50" },
            { name: "maxMW", label: "Max MW", type: "number", placeholder: "" },
            { name: "minAcres", label: "Min acres", type: "number", placeholder: "100" },
            { name: "state", label: "State", type: "text", placeholder: "TX" },
            { name: "interconnection", label: "Interconnection", type: "select", options: [
              { value: "", label: "Any" },
              { value: "study", label: "Feasibility study" },
              { value: "facility-study", label: "Facility study" },
              { value: "LGIA", label: "LGIA executed" },
              { value: "energized", label: "Energized" },
            ]},
            { name: "ppa", label: "PPA", type: "select", options: [
              { value: "", label: "Any" },
              { value: "signed", label: "Signed" },
              { value: "in-negotiation", label: "In negotiation" },
              { value: "available", label: "Available" },
              { value: "none", label: "None" },
            ]},
            { name: "deal", label: "Deal", type: "select", options: [
              { value: "", label: "Any" },
              { value: "sale", label: "Sale" },
              { value: "lease", label: "Lease" },
              { value: "JV", label: "Joint venture" },
            ]},
            { name: "water", label: "Water", type: "select", options: [
              { value: "", label: "Any" },
              { value: "yes", label: "Yes" },
              { value: "limited", label: "Limited" },
              { value: "no", label: "No" },
              { value: "unknown", label: "Unknown" },
            ]},
            { name: "fiber", label: "Fiber", type: "select", options: [
              { value: "", label: "Any" },
              { value: "yes", label: "On site" },
              { value: "near", label: "Nearby" },
              { value: "no", label: "None" },
            ]},
            { name: "maxPrice", label: "Max asking ($)", type: "number", placeholder: "20000000" },
            { name: "sort", label: "Sort", type: "select", options: [
              { value: "", label: "Newest" },
              { value: "mw-desc", label: "MW (high to low)" },
              { value: "mw-asc", label: "MW (low to high)" },
              { value: "price-asc", label: "Price (low to high)" },
              { value: "price-desc", label: "Price (high to low)" },
              { value: "acres-desc", label: "Acres (high to low)" },
            ]},
          ]}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <Link
            key={l.id}
            href={`/listings/land/${l.id}`}
            className="group block rounded-xl border border-slate-200 bg-white p-5 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition leading-snug">{l.title}</h3>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {l.pricingModel}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {l.location}{l.county ? ` · ${l.county}` : ""} · {l.acres} acres
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
              <Spec label="Power" value={`${l.availableMW} MW`} accent />
              <Spec label="PPA" value={l.ppaStatus || "—"} />
              <Spec label="Interconnection" value={l.interconnectionStage || "—"} />
              <Spec label="Water" value={l.waterAvailable || "—"} />
              {l.askingPrice && (
                <Spec label="Asking" value={`$${(l.askingPrice / 1_000_000).toFixed(1)}M`} />
              )}
              {l.askingPrice && (
                <Spec label="$/MW" value={`$${Math.round(l.askingPrice / l.availableMW / 1000)}k`} />
              )}
            </div>
            <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Listed by {l.owner.company || l.owner.name}
            </p>
          </Link>
        ))}
        {listings.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No listings match. <Link href="/listings/land" className="text-emerald-600 hover:underline">Clear filters</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Spec({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={accent ? "text-emerald-700 font-semibold" : "text-slate-900 font-medium"}>{value}</div>
    </div>
  );
}
