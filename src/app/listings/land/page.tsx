import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { landListingsVisibleToWhere } from "@/lib/access";
import { LandFilterBar } from "@/components/land-filter-bar";
import { AiSearch } from "@/components/ai-search";
import { ListingsMap } from "@/components/listings-map";
import { parseAiQuery, scoreListingAgainstQuery, type ParsedQuery } from "@/lib/ai-query";
import { getR2DownloadUrl, isR2Configured } from "@/lib/r2";
import { Prisma } from "@prisma/client";

// Listings page hits the DB on every request (per-user access filtering, fresh
// approvalStatus from admin actions). Without force-dynamic, Next.js route
// caches the rendered output and the seedDemoLandListings + revalidatePath
// pair stops being enough to show new rows in browse. Cheap to render anyway.
export const dynamic = "force-dynamic";

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
    aiq?: string; // natural-language AI query — parsed server-side into the filter set
  };
}

export default async function LandListingsPage({ searchParams }: Props) {
  const f = searchParams;
  const user = await getCurrentUser();
  // Privacy: every browse query is scoped to listings the current user is
  // allowed to see. landListingsVisibleToWhere enforces the four-way rule
  // (owner / admin / public+approved / invited).
  if (!user) {
    // Preserve the entire query string when bouncing to sign-in so the
    // buyer comes back to the same AI query / filters after auth.
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (typeof v === "string" && v.length > 0) qs.set(k, v);
    }
    const next = qs.toString() ? `/listings/land?${qs.toString()}` : "/listings/land";
    redirect(`/auth/signin?next=${encodeURIComponent(next)}`);
  }

  // AI search: if the buyer typed a natural-language query, parse it once
  // server-side into the same filter shape the page already understands,
  // then merge with any explicit filter params (explicit wins). This is the
  // server-side bridge between the AiSearch component and the existing
  // filter pipeline.
  let parsedAi: ParsedQuery | null = null;
  if (f.aiq && f.aiq.trim().length >= 4) {
    try {
      parsedAi = await parseAiQuery(f.aiq);
    } catch {
      parsedAi = { intent: f.aiq };
    }
  }

  // Effective filter values: explicit URL param > AI-parsed > undefined.
  const eff = {
    state: f.state || parsedAi?.state,
    minMW: f.minMW ? Number(f.minMW) : parsedAi?.minMW,
    maxMW: f.maxMW ? Number(f.maxMW) : parsedAi?.maxMW,
    minAcres: f.minAcres ? Number(f.minAcres) : parsedAi?.minAcres,
    ppa: f.ppa || parsedAi?.ppa,
    interconnection: f.interconnection || parsedAi?.interconnection,
    water: f.water || parsedAi?.water,
    fiber: f.fiber || parsedAi?.fiber,
    deal: f.deal || parsedAi?.deal,
    maxPrice: f.maxPrice ? Number(f.maxPrice) : parsedAi?.maxPrice,
  };

  const access = landListingsVisibleToWhere({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });
  const where: Prisma.PoweredLandListingWhereInput = {
    ...(access as Prisma.PoweredLandListingWhereInput),
  };
  if (f.q) {
    where.OR = [
      { title: { contains: f.q } },
      { location: { contains: f.q } },
      { description: { contains: f.q } },
      { county: { contains: f.q } },
      { state: { contains: f.q } },
    ];
  }
  if (eff.minMW != null) where.availableMW = { ...((where.availableMW as object) || {}), gte: eff.minMW };
  if (eff.maxMW != null) where.availableMW = { ...((where.availableMW as object) || {}), lte: eff.maxMW };
  if (eff.minAcres != null) where.acres = { gte: eff.minAcres };
  if (eff.state) where.state = eff.state;
  if (eff.interconnection) where.interconnectionStage = eff.interconnection;
  if (eff.ppa) where.ppaStatus = eff.ppa;
  if (eff.deal) where.pricingModel = eff.deal;
  if (eff.water) where.waterAvailable = eff.water;
  if (eff.fiber) where.fiberAvailable = eff.fiber;
  if (eff.maxPrice != null) where.askingPrice = { lte: eff.maxPrice };

  // Default ordering — newest first. AI search overrides this below with a
  // relevance-based sort.
  let orderBy: Prisma.PoweredLandListingOrderByWithRelationInput = { createdAt: "desc" };
  if (f.sort === "mw-desc") orderBy = { availableMW: "desc" };
  else if (f.sort === "mw-asc") orderBy = { availableMW: "asc" };
  else if (f.sort === "price-asc") orderBy = { askingPrice: "asc" };
  else if (f.sort === "price-desc") orderBy = { askingPrice: "desc" };
  else if (f.sort === "acres-desc") orderBy = { acres: "desc" };

  const listings = await prisma.poweredLandListing.findMany({
    where,
    orderBy,
    include: {
      owner: { select: { name: true, company: true } },
      photos: {
        // First photo by sortOrder is the cover. We pull only one — the
        // detail page handles the full gallery.
        orderBy: [{ sortOrder: "asc" }, { uploadedAt: "asc" }],
        take: 1,
        select: { id: true, r2Key: true },
      },
    },
  });

  // Resolve cover-photo URLs in parallel. getR2DownloadUrl passes through
  // http(s) URLs (used by the demo seed) and presigns real R2 keys for
  // user-uploaded photos. If R2 isn't configured (dev), URL keys still work.
  const r2Ready = isR2Configured();
  const coverByListing: Record<string, string | null> = {};
  await Promise.all(
    listings.map(async (l) => {
      const first = l.photos[0];
      if (!first) {
        coverByListing[l.id] = null;
        return;
      }
      const isUrl = first.r2Key.startsWith("http://") || first.r2Key.startsWith("https://");
      if (!isUrl && !r2Ready) {
        coverByListing[l.id] = null;
        return;
      }
      try {
        coverByListing[l.id] = await getR2DownloadUrl(first.r2Key);
      } catch {
        coverByListing[l.id] = null;
      }
    }),
  );

  // AI relevance sort — only applied when the buyer arrived via AI search.
  // Each listing scored 0-100 against the parsed query; higher = better
  // match. Stable sort, so ties fall back to default order.
  let listingsSorted = listings;
  if (parsedAi) {
    listingsSorted = [...listings].sort((a, b) => {
      const sa = scoreListingAgainstQuery(a, parsedAi!);
      const sb = scoreListingAgainstQuery(b, parsedAi!);
      return sb - sa;
    });
  }

  // Tag each listing with how the user has access — drives the badge on
  // each card ("Yours" / "Shared with you" / Public).
  const listingsWithAccess = listingsSorted.map((l) => {
    let accessBadge: "yours" | "shared" | "public" = "public";
    if (l.ownerId === user.id) accessBadge = "yours";
    else if (l.visibility !== "public") accessBadge = "shared";
    const score = parsedAi ? scoreListingAgainstQuery(l, parsedAi) : null;
    return { listing: l, accessBadge, score, cover: coverByListing[l.id] };
  });

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null;

  // Map listings prop is the same regardless of view — we always render
  // the map (it's the centerpiece now).
  const mapListings = listingsWithAccess.map(({ listing: l }) => ({
    id: l.id,
    title: l.title,
    state: l.state,
    county: l.county,
    availableMW: l.availableMW,
    acres: l.acres,
    ppaStatus: l.ppaStatus,
    pricingModel: l.pricingModel,
    askingPrice: l.askingPrice,
  }));

  return (
    <div>
      {/* HERO STRIP — eyebrow + tight value statement. Sits above the
          search and the split view, edge-to-edge with hairline rules in
          the Swiss style of the homepage. */}
      <section className="border-b border-[var(--color-rule)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-12 pb-8 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold">
              02 / Browse
            </div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-neutral-600">
              {listings.length} {listings.length === 1 ? "site" : "sites"} ·{" "}
              {Math.round(listings.reduce((s, l) => s + l.availableMW, 0))} MW total ·{" "}
              MNDA-protected
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Powered land,{" "}
              <span className="text-emerald-700">on the map.</span>
            </h1>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.6] text-neutral-700">
              Every utility-ready parcel currently listed on Livio Land. Pan the map,
              filter by MW and PPA status, or describe your ideal site in plain English
              and let AI rank them for you.
            </p>
            <div className="mt-6">
              <AiSearch variant="compact" defaultValue={f.aiq ?? ""} />
            </div>
            {parsedAi && (
              <AiQuerySummary parsed={parsedAi} originalQuery={f.aiq ?? ""} />
            )}
            <div className="mt-5">
              <LandFilterBar />
            </div>
            <div className="mt-5 flex justify-end">
              <Link
                href="/listings/new/land"
                className="inline-flex items-center gap-1.5 bg-emerald-700 px-4 py-2 text-[13px] font-medium text-white hover:bg-emerald-800 transition"
              >
                + List land
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SPLIT VIEW — listing list left, sticky Google Map right. On
          mobile the map collapses to top, list runs underneath. The map
          is wrapped in Mac-style chrome (dot dot dot · URL bar · "Open
          map" link) inspired by grid.golivio.com's 3D viewer presentation. */}
      <section className="border-b border-[var(--color-rule)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              <div className="text-base font-medium text-slate-700">No listings match your filters.</div>
              <Link
                href="/listings/land"
                className="mt-3 inline-flex items-center gap-1 text-emerald-700 font-medium hover:underline"
              >
                Clear all filters →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Listings column — scrolls within its own height on
                  desktop so the map stays put while you browse. On
                  mobile/tablet it just flows. */}
              <div className="col-span-12 lg:col-span-7">
                <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-emerald-700">
                  {listingsWithAccess.length} {listingsWithAccess.length === 1 ? "result" : "results"}
                  {parsedAi ? " · ranked by AI relevance" : " · newest first"}
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listingsWithAccess.map(({ listing: l, accessBadge, score, cover }) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      accessBadge={accessBadge}
                      score={score}
                      cover={cover}
                    />
                  ))}
                </div>
              </div>

              {/* Map column — sticky on desktop so it's always visible
                  while the user scans the list. */}
              <div className="col-span-12 lg:col-span-5">
                <div className="lg:sticky lg:top-6">
                  <MapWindow listings={mapListings} apiKey={mapsKey} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/** Mac-style window chrome wrapping the Google Map — pulls the
 * grid.golivio.com 3D-viewer presentation pattern over to Land. The
 * traffic-light dots, URL bar, and "Open map" anchor are pure decoration
 * but they immediately read as "this is the live, primary feature."
 */
function MapWindow({
  listings,
  apiKey,
}: {
  listings: import("@/components/listings-map").MapListing[];
  apiKey: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 text-center text-[11px] tracking-[0.06em] text-neutral-500 font-medium">
          land.golivio.com · live map · {listings.length} site{listings.length === 1 ? "" : "s"} · drag to pan
        </div>
        <div className="text-[11px] text-emerald-700 font-semibold">● live</div>
      </div>
      <div className="h-[640px] w-full">
        <ListingsMap listings={listings} apiKey={apiKey} layout="split" />
      </div>
      <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-[11px] text-neutral-500">
        Pins show approximate state centroid · click for site details · per-listing geocoding next.
      </div>
    </div>
  );
}

function ListingCard({
  listing: l,
  accessBadge,
  score,
  cover,
}: {
  listing: {
    id: string;
    title: string;
    location: string;
    county: string | null;
    acres: number;
    availableMW: number;
    ppaStatus: string | null;
    interconnectionStage: string | null;
    waterAvailable: string | null;
    pricingModel: string;
    askingPrice: number | null;
    owner: { name: string; company: string | null };
  };
  accessBadge: "yours" | "shared" | "public";
  score: number | null;
  cover: string | null;
}) {
  return (
    <Link
      href={`/listings/land/${l.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={l.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-emerald-700/50 text-xs uppercase tracking-wide">
            No photo yet
          </div>
        )}
        {score != null && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm ${
              score >= 70 ? "bg-emerald-600" : score >= 50 ? "bg-amber-500" : "bg-slate-500"
            }`}
            title="AI relevance to your query"
          >
            {score}% match
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 shadow-sm">
          {l.pricingModel}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition leading-snug text-[15px]">{l.title}</h3>
          {accessBadge === "yours" && (
            <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
              Yours
            </span>
          )}
          {accessBadge === "shared" && (
            <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-violet-800">
              Shared
            </span>
          )}
        </div>
        <p className="mt-1 text-[12px] text-slate-500">
          {l.location}{l.county ? ` · ${l.county}` : ""} · {l.acres} acres
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2 text-[13px]">
          <Spec label="Power" value={`${l.availableMW} MW`} accent />
          <Spec label="PPA" value={l.ppaStatus || "—"} />
          <Spec label="ICX" value={l.interconnectionStage || "—"} />
          <Spec label="Water" value={l.waterAvailable || "—"} />
          {l.askingPrice && (
            <Spec label="Asking" value={`$${(l.askingPrice / 1_000_000).toFixed(1)}M`} />
          )}
          {l.askingPrice && (
            <Spec label="$/MW" value={`$${Math.round(l.askingPrice / l.availableMW / 1000)}k`} />
          )}
        </div>
        <p className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          Listed by {l.owner.company || l.owner.name}
        </p>
      </div>
    </Link>
  );
}

function Spec({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</div>
      <div className={accent ? "text-emerald-700 font-semibold" : "text-slate-900 font-medium"}>{value}</div>
    </div>
  );
}

/**
 * Banner that surfaces what the AI parsed out of a natural-language query.
 * Buyer sees "We read this as: TX · 100+ MW · signed PPA" and can refine
 * if the parse missed something. Renders nothing if no constraints were
 * extracted (rare — usually we get at least one).
 */
function AiQuerySummary({
  parsed,
  originalQuery,
}: {
  parsed: ParsedQuery;
  originalQuery: string;
}) {
  const chips: string[] = [];
  if (parsed.state) chips.push(parsed.state);
  if (parsed.minMW != null) {
    chips.push(parsed.maxMW != null ? `${parsed.minMW}–${parsed.maxMW} MW` : `${parsed.minMW}+ MW`);
  } else if (parsed.maxMW != null) {
    chips.push(`up to ${parsed.maxMW} MW`);
  }
  if (parsed.minAcres) chips.push(`${parsed.minAcres}+ acres`);
  if (parsed.ppa) chips.push(`PPA ${parsed.ppa}`);
  if (parsed.interconnection) chips.push(parsed.interconnection);
  if (parsed.water === "yes") chips.push("water on site");
  if (parsed.fiber === "yes") chips.push("fiber on site");
  if (parsed.deal) chips.push(parsed.deal);
  if (parsed.maxPrice != null) chips.push(`under $${(parsed.maxPrice / 1_000_000).toFixed(1)}M`);

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-3 text-sm text-emerald-900">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
          We read this as
        </span>
        {chips.length === 0 ? (
          <span className="text-emerald-800/80 italic">
            We couldn&apos;t parse specific filters from &quot;{originalQuery}&quot;. Showing all listings, ranked by best match.
          </span>
        ) : (
          chips.map((c) => (
            <span
              key={c}
              className="rounded-full bg-white border border-emerald-200 px-2.5 py-0.5 text-xs font-medium"
            >
              {c}
            </span>
          ))
        )}
      </div>
      {parsed.intent && originalQuery && parsed.intent !== originalQuery && (
        <div className="mt-1.5 text-[12px] text-emerald-800/70">
          Original: &ldquo;{originalQuery}&rdquo;
        </div>
      )}
    </div>
  );
}

