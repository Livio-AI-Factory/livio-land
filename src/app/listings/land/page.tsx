import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { landListingsVisibleToWhere } from "@/lib/access";
import { LandFilterBar } from "@/components/land-filter-bar";
import { AiSearch } from "@/components/ai-search";
import { ListingsMap } from "@/components/listings-map";
import { ListingsViewToggle } from "@/components/listings-view-toggle";
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
    view?: string; // "map" | "grid"
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

  const view: "grid" | "map" = f.view === "map" ? "map" : "grid";
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Powered Land</h1>
          <p className="mt-1 text-sm text-slate-600">
            {listings.length} {listings.length === 1 ? "listing" : "listings"} ·{" "}
            {Math.round(listings.reduce((s, l) => s + l.availableMW, 0))} MW total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ListingsViewToggle current={view} />
          <Link
            href="/listings/new/land"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition"
          >
            + List land
          </Link>
        </div>
      </div>

      {/* AI search bar — buyers type natural language, server parses into
          structured filters, results re-order by relevance. Same component
          on the homepage hero, just visually compact here. */}
      <div className="mt-6">
        <AiSearch variant="compact" defaultValue={f.aiq ?? ""} />
      </div>

      {/* AI query summary banner — shown when the buyer arrived via AI
          search. Tells them what we extracted and lets them refine. */}
      {parsedAi && (
        <AiQuerySummary parsed={parsedAi} originalQuery={f.aiq ?? ""} />
      )}

      <div className="mt-4">
        <LandFilterBar />
      </div>

      {view === "map" ? (
        <div className="mt-8">
          <ListingsMap
            apiKey={mapsKey}
            listings={listingsWithAccess.map(({ listing: l }) => ({
              id: l.id,
              title: l.title,
              state: l.state,
              county: l.county,
              availableMW: l.availableMW,
              acres: l.acres,
              ppaStatus: l.ppaStatus,
              pricingModel: l.pricingModel,
              askingPrice: l.askingPrice,
            }))}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listingsWithAccess.map(({ listing: l, accessBadge, score, cover }) => (
            <Link
              key={l.id}
              href={`/listings/land/${l.id}`}
              className="group block overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {/* Cover photo — first uploaded photo, falls back to gradient
                  placeholder. Aspect 16:9. */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100">
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
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition leading-snug">{l.title}</h3>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {accessBadge === "yours" && (
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                        Yours
                      </span>
                    )}
                    {accessBadge === "shared" && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-800">
                        Shared with you
                      </span>
                    )}
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {l.pricingModel}
                    </span>
                  </div>
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
              </div>
            </Link>
          ))}
          {listings.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No listings match. <Link href="/listings/land" className="text-emerald-600 hover:underline">Clear filters</Link>
            </div>
          )}
        </div>
      )}
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
