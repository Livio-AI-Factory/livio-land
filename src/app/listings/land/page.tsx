import Link from "next/link";
import { prisma } from "@/lib/db";
import { SearchBar } from "@/components/search-bar";
import { Prisma } from "@prisma/client";

interface Props {
  searchParams: {
    q?: string;
    minMW?: string;
    minAcres?: string;
    interconnection?: string;
  };
}

export default async function LandListingsPage({ searchParams }: Props) {
  const where: Prisma.PoweredLandListingWhereInput = {
    status: "available",
  };

  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { location: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
    ];
  }
  if (searchParams.minMW) where.availableMW = { gte: Number(searchParams.minMW) };
  if (searchParams.minAcres) where.acres = { gte: Number(searchParams.minAcres) };
  if (searchParams.interconnection) where.interconnectionStage = searchParams.interconnection;

  const listings = await prisma.poweredLandListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, company: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Powered Land</h1>
          <p className="mt-1 text-slate-600">
            {listings.length} {listings.length === 1 ? "listing" : "listings"} available
          </p>
        </div>
        <Link
          href="/listings/new/land"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + List land
        </Link>
      </div>

      <div className="mt-6">
        <SearchBar
          basePath="/listings/land"
          fields={[
            { name: "q", label: "Keyword / location", type: "text", placeholder: "ERCOT, Texas, MISO..." },
            { name: "minMW", label: "Min MW", type: "number", placeholder: "50" },
            { name: "minAcres", label: "Min acres", type: "number", placeholder: "100" },
            { name: "interconnection", label: "Interconnection", type: "select", options: [
              { value: "", label: "Any" },
              { value: "study", label: "Feasibility study" },
              { value: "facility-study", label: "Facility study" },
              { value: "LGIA", label: "LGIA executed" },
              { value: "energized", label: "Energized" },
            ]},
          ]}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <Link
            key={l.id}
            href={`/listings/land/${l.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-500 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-slate-900">{l.title}</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {l.pricingModel}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{l.location}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Spec label="Power" value={`${l.availableMW} MW`} />
              <Spec label="Acres" value={`${l.acres}`} />
              <Spec label="Interconnection" value={l.interconnectionStage || "—"} />
              <Spec label="PPA" value={l.ppaStatus || "—"} />
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Listed by {l.owner.company || l.owner.name}
            </p>
          </Link>
        ))}
        {listings.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No listings match your filters yet.{" "}
            <Link href="/listings/land" className="text-brand-600 hover:underline">
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
