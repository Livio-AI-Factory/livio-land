import Link from "next/link";
import { prisma } from "@/lib/db";
import { SearchBar } from "@/components/search-bar";
import { Prisma } from "@prisma/client";

interface Props {
  searchParams: {
    q?: string;
    minMW?: string;
    maxRate?: string;
    state?: string;
    tier?: string;
    cooling?: string;
    minDensity?: string;
    sort?: string;
  };
}

export default async function DcListingsPage({ searchParams }: Props) {
  const f = searchParams;
  const where: Prisma.DataCenterListingWhereInput = { status: "available" };
  if (f.q) {
    where.OR = [
      { title: { contains: f.q } },
      { location: { contains: f.q } },
      { description: { contains: f.q } },
      { county: { contains: f.q } },
      { state: { contains: f.q } },
      { network: { contains: f.q } },
    ];
  }
  if (f.minMW) where.availableMW = { gte: Number(f.minMW) };
  if (f.maxRate) where.ratePerKWh = { lte: Number(f.maxRate) };
  if (f.tier) where.tier = f.tier;
  if (f.cooling) where.coolingType = f.cooling;
  if (f.state) where.state = f.state;
  if (f.minDensity) where.powerDensityKWPerRack = { gte: Number(f.minDensity) };

  let orderBy: Prisma.DataCenterListingOrderByWithRelationInput = { createdAt: "desc" };
  if (f.sort === "mw-desc") orderBy = { availableMW: "desc" };
  else if (f.sort === "mw-asc") orderBy = { availableMW: "asc" };
  else if (f.sort === "rate-asc") orderBy = { ratePerKWh: "asc" };
  else if (f.sort === "rate-desc") orderBy = { ratePerKWh: "desc" };

  const listings = await prisma.dataCenterListing.findMany({
    where,
    orderBy,
    include: { owner: { select: { name: true, company: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Data Center Capacity</h1>
          <p className="mt-1 text-sm text-slate-600">
            {listings.length} {listings.length === 1 ? "listing" : "listings"} · {Math.round(listings.reduce((s,l)=>s+l.availableMW,0))} MW total
          </p>
        </div>
        <Link
          href="/listings/new/dc"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
        >
          + List capacity
        </Link>
      </div>

      <div className="mt-6">
        <SearchBar
          basePath="/listings/dc"
          fields={[
            { name: "q", label: "Keyword / city / carrier", type: "text", placeholder: "Ashburn, AWS, immersion..." },
            { name: "minMW", label: "Min MW", type: "number", placeholder: "10" },
            { name: "maxRate", label: "Max $/kWh", type: "number", placeholder: "0.10", step: "0.001" },
            { name: "state", label: "State", type: "text", placeholder: "VA" },
            { name: "tier", label: "Tier", type: "select", options: [
              { value: "", label: "Any" },
              { value: "Tier I", label: "Tier I" },
              { value: "Tier II", label: "Tier II" },
              { value: "Tier III", label: "Tier III" },
              { value: "Tier IV", label: "Tier IV" },
            ]},
            { name: "cooling", label: "Cooling", type: "select", options: [
              { value: "", label: "Any" },
              { value: "air", label: "Air" },
              { value: "liquid", label: "Liquid" },
              { value: "immersion", label: "Immersion" },
              { value: "hybrid", label: "Hybrid" },
            ]},
            { name: "minDensity", label: "Min density (kW/rack)", type: "number", placeholder: "20" },
            { name: "sort", label: "Sort", type: "select", options: [
              { value: "", label: "Newest" },
              { value: "mw-desc", label: "MW (high to low)" },
              { value: "mw-asc", label: "MW (low to high)" },
              { value: "rate-asc", label: "Rate (low to high)" },
              { value: "rate-desc", label: "Rate (high to low)" },
            ]},
          ]}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <Link
            key={l.id}
            href={`/listings/dc/${l.id}`}
            className="group block rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-500 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 transition leading-snug">{l.title}</h3>
              <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                {l.tier || "Tier —"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {l.location}{l.county ? ` · ${l.county}` : ""}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
              <Spec label="Available" value={`${l.availableMW} MW`} accent />
              <Spec label="Total" value={`${l.totalCapacityMW} MW`} />
              <Spec label="Rate" value={l.ratePerKWh ? `$${l.ratePerKWh.toFixed(3)}/kWh` : "On request"} />
              <Spec label="Cooling" value={l.coolingType || "—"} />
              <Spec label="Available" value={new Date(l.availabilityDate).toLocaleDateString()} />
              {l.powerDensityKWPerRack && <Spec label="Density" value={`${l.powerDensityKWPerRack} kW/rack`} />}
            </div>
            <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Listed by {l.owner.company || l.owner.name}
            </p>
          </Link>
        ))}
        {listings.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No listings match. <Link href="/listings/dc" className="text-brand-600 hover:underline">Clear filters</Link>
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
      <div className={accent ? "text-brand-700 font-semibold" : "text-slate-900 font-medium"}>{value}</div>
    </div>
  );
}
