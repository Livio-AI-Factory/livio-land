import Link from "next/link";
import { prisma } from "@/lib/db";

// Buy-side positioning: Livio Land is an engine that sources utility-ready
// powered land for AI Data Center developers. Landowners list because they
// see we represent the buyer.
//
// Voice rules (per Ethan, Apr 30 2026):
//   - Never say "marketplace" — say "engine" / "sourcing platform".
//   - Never say "data center" — always "AI Data Center".
//   - Lead with the buyer's value. Sellers come second.
//
// Visual style (Swiss / International Typographic Style, May 2026):
//   - 12-column grid; hero copy spans cols 1–8, ragged-right whitespace 9–12.
//   - Type does the work: 64–72px hero, generous leading, no decorative pills.
//   - Single emerald accent reserved for CTAs and emphasized data.
//   - Hairline 1px rules separate sections — no shadows, no rounded
//     corners, no soft pastel panels.
//   - Numbers are foregrounded (Müller-Brockmann school): live MW + listing
//     count rendered as scale anchors above the fold.

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Live counters for the hero — Swiss design celebrates numbers as
  // visual elements. Wrapped in try/catch so a DB hiccup doesn't 500
  // the homepage.
  let listingsCount = 0;
  let totalMW = 0;
  try {
    const live = await prisma.poweredLandListing.findMany({
      where: { approvalStatus: "approved", visibility: "public" },
      select: { availableMW: true },
    });
    listingsCount = live.length;
    totalMW = live.reduce((s, r) => s + (r.availableMW || 0), 0);
  } catch {
    // ignore — leave counters at zero
  }

  return (
    <div>
      {/* HERO */}
      <section className="border-b border-[var(--color-rule)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-24 pb-32 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-1">
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold">
              01 / Source
            </div>
          </div>
          <div className="col-span-12 md:col-span-8">
            <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-neutral-600">
              For AI Data Center developers · hyperscalers · AI labs · investors
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.02]">
              The fastest way to find your next{" "}
              <span className="text-emerald-700">AI Data Center site.</span>
            </h1>
            <p className="mt-8 max-w-[58ch] text-lg leading-[1.55] text-neutral-700">
              Livio Land is the sourcing engine that puts utility-ready powered
              parcels in front of AI Data Center developers, hyperscalers, and AI
              labs. Tell us your MW, region, and timeline — get vetted, MNDA-protected
              sites with PPA status and interconnection stage on file, ready to
              underwrite.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/listings/land"
                className="bg-emerald-700 px-6 py-3.5 text-[14px] font-medium text-white hover:bg-emerald-800"
              >
                Source sites for my AI Data Center →
              </Link>
              <Link
                href="/list"
                className="text-[14px] font-medium text-[var(--color-text)] underline-offset-4 hover:underline"
              >
                I have land to list ↗
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-rule)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 grid grid-cols-12 divide-x divide-[var(--color-rule)]">
            <div className="col-span-6 md:col-span-3 px-0 md:px-8 py-8">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-600">
                Live listings
              </div>
              <div className="mt-2 text-5xl font-bold tracking-tight">
                {listingsCount}
              </div>
            </div>
            <div className="col-span-6 md:col-span-3 px-6 md:px-8 py-8">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-600">
                MW available
              </div>
              <div className="mt-2 text-5xl font-bold tracking-tight">
                {totalMW.toLocaleString()}
              </div>
            </div>
            <div className="col-span-12 md:col-span-3 px-6 md:px-8 py-8">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-600">
                Buyer-side fee
              </div>
              <div className="mt-2 text-5xl font-bold tracking-tight">2%</div>
              <div className="mt-1 text-[12px] text-neutral-500">at close · vs 5–6% broker</div>
            </div>
            <div className="col-span-12 md:col-span-3 px-6 md:px-8 py-8">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-600">
                Coverage
              </div>
              <div className="mt-2 text-5xl font-bold tracking-tight">USA</div>
              <div className="mt-1 text-[12px] text-neutral-500">PJM · ERCOT · BPA · MISO · APS</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-rule)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold">
              02 / Why
            </div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--color-rule)]">
              <ValueProp kicker="Demand-first" headline="Built for AI Data Center developers writing checks today." body="Hyperscalers, AI labs, and HPC operators source through Livio Land because every parcel comes with the data their underwriting team needs — not a broker phone number." first />
              <ValueProp kicker="Vetted supply" headline="MW, PPA status, interconnection stage on file." body="Every listing has photos, acreage, deliverable MW, signed-or-pending PPA price, and an LGIA / facility-study status. If a parcel doesn't have what your IC needs, you'll know before you click in." />
              <ValueProp kicker="MNDA-first" headline="Sellers sign MNDA + non-circumvention before they list." body="Read site details without telling sellers what you're building. Every owner signed Livio's Mutual NDA + non-circumvention before getting on the platform." />
              <ValueProp kicker="2% — at close" headline="A success fee that doesn't show up in the LOI." body="Buyer-side success fee is 2% of total Transaction value, owed only when a definitive agreement is signed. Vs. 5–6% to a traditional broker. Seller-side fee is a separate 2%." />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold">
              03 / How
            </div>
          </div>
          <div className="col-span-12 md:col-span-10 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--color-rule)]">
            <div className="md:pr-12 pb-12 md:pb-0">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-emerald-700">
                Primary
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight leading-tight">For AI Data Center developers</h2>
              <p className="mt-4 text-[15px] leading-[1.6] text-neutral-700">Stop sourcing through brokers and back-channel intros. Specify your MW, region, PPA price ceiling, and interconnection-stage requirements — Livio Land surfaces utility-ready parcels that already match.</p>
              <ul className="mt-8 space-y-3 text-[14px] leading-[1.55] text-neutral-800">
                <Item>Filter by MW, state, PPA status, interconnection stage, water, fiber</Item>
                <Item>Read public Q&amp;A from other AI Data Center developers about each site</Item>
                <Item>Ask the questions that matter — water rights, zoning, energization timeline</Item>
                <Item>2% buyer-side success fee at close — paid only on a deal that goes through</Item>
              </ul>
              <Link href="/listings/land" className="mt-10 inline-block bg-emerald-700 px-5 py-3 text-[14px] font-medium text-white hover:bg-emerald-800">Start sourcing sites →</Link>
            </div>

            <div className="md:pl-12 pt-12 md:pt-0">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-500">
                Secondary
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight leading-tight">For landowners</h2>
              <p className="mt-4 text-[15px] leading-[1.6] text-neutral-700">The AI Data Center developers and hyperscalers shopping on Livio Land are searching for parcels right now. Listing here puts your site directly in front of the buyers — without a broker taking 5%.</p>
              <ul className="mt-8 space-y-3 text-[14px] leading-[1.55] text-neutral-800">
                <Item>List acres, available MW, PPA status, interconnection stage</Item>
                <Item>Upload site photos, drone shots, surveys, utility LOIs</Item>
                <Item>Answer buyer questions publicly — build trust, save time on intros</Item>
                <Item>2% seller-side fee at close — the lowest in the market</Item>
              </ul>
              <Link href="/list" className="mt-10 inline-block border border-[var(--color-text)] px-5 py-3 text-[14px] font-medium text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)]">List your land →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueProp({ kicker, headline, body, first }: { kicker: string; headline: string; body: string; first?: boolean }) {
  return (
    <div className={`px-0 py-8 md:py-0 ${first ? "md:pr-8" : "md:px-8"}`}>
      <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-emerald-700">{kicker}</div>
      <div className="mt-3 text-[18px] font-semibold leading-snug text-[var(--color-text)]">{headline}</div>
      <div className="mt-3 text-[13px] leading-[1.6] text-neutral-600">{body}</div>
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-2 inline-block h-[6px] w-[6px] bg-emerald-700 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
