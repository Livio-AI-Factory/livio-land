import Link from "next/link";
import { prisma } from "@/lib/db";
import { SearchBar } from "@/components/search-bar";
import { Prisma } from "@prisma/client";

interface Props {
  searchParams: {
    q?: string;
    minMW?: string;
    maxRate?: string;
    tier?: string;
  };
}

export default async function DcListingsPage({ searchParams }: Props) {
  const where: Prisma.DataCenterListingWhereInput = {
    status: "available",
  };

  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { location: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
    ];
  }
  if (searchParams.minMW) {
    where.availableMW = { gte: Number(searchParams.minMW) };
  }
  if (searchParams.maxRate) {
    where.ratePerKWh = { lte: Number(searchParams.maxRate) };
  }
  if (searchParams.tier) {
    where.tier = searchParams.tier;
  }

  const listings = await prisma.dataCenterListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, company: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Center Capacity</h1>
          <p className="mt-1 text-slate-600">
            {listings.length} {listings.length === 1 ? "listing" : "listings"} available
          </p>
        </div>
        <Link
          href="/listings/new/dc"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + List capacity
        </Link>
      </div>

      <div className="mt-6">
        <SearchBar
          basePath="/listings/dc"
          fields={[
            { name: "q", label: "Keyword / location", type: "text", placeholder: "Ashburn, hyperscale..." },
            { name: "minMW", label: "Min MW", type: "number", placeholder: "10" },
            { name: "maxRate", label: "Max $/kWh", type: "number", placeholder: "0.10", step: "0.001" },
            { name: "tier", label: "Tier", type: "select", options: [
              { value: "", label: "Any" },
              { value: "Tier I", label: "Tier I" },
              { value: "Tier II", label: "Tier II" },
              { value: "Tier III", label: "Tier III" },
              { value: "Tier IV", label: "Tier IV" },
            ]},
          ]}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <Link
            key={l.id}
            href={`/listings/dc/${l.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-500 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-slate-900">{l.title}</h3>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                {l.tier || "Tier —"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{l.location}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Spec label="Available" value={`${l.availableMW} MW`} />
              <Spec label="Total" value={`${l.totalCapacityMW} MW`} />
              <Spec
                label="Rate"
                value={l.ratePerKWh ? `$${l.ratePerKWh.toFixed(3)}/kWh` : "—"}
              />
              <Spec
                label="Available from"
                value={new Date(l.availabilityDate).toLocaleDateString()}
              />
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Listed by {l.owner.company || l.owner.name}
            </p>
          </Link>
        ))}
        {listings.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No listings match your filters yet.{" "}
            <Link href="/listings/dc" className="text-brand-600 hover:underline">
              Clear filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-900 font-medium">{value}</div>
    </div>
  );
}
