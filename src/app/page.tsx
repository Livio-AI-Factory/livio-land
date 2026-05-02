import Link from "next/link";

// Buy-side positioning: Livio Land is an engine that sources utility-ready
// powered land for AI Data Center developers. Landowners list because they
// see we represent the buyer.
//
// Voice rules (per Ethan, Apr 30 2026):
//   - Never say "marketplace" — say "engine" / "sourcing platform".
//   - Never say "data center" — always "AI Data Center".
//   - Lead with the buyer's value. Sellers come second; their tile reads
//     more like an invite to join a buyer-rich pool than a pitch.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div>
      {/* Hero — speaks directly to AI Data Center developers / hyperscalers /
          AI labs sourcing land. */}
      <section className="bg-hero-gradient border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
              For AI Data Center developers · hyperscalers · AI labs · investors
            </span>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-900">
              The fastest way to find your next{" "}
              <span className="text-emerald-600">AI Data Center site</span>.
            </h1>
            <p className="mt-4 text-xl text-slate-700">
              Livio Land is the sourcing engine that puts utility-ready powered
              parcels in front of AI Data Center developers, hyperscalers, and
              AI labs. Tell us your MW, region, and timeline — get vetted,
              MNDA-protected sites with PPA status and interconnection stage
              on file, ready to underwrite.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/listings/land"
                className="rounded-md bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
              >
                Source sites for my AI Data Center →
              </Link>
              <Link
                href="/listings/new/land"
                className="rounded-md border border-slate-300 bg-white px-5 py-3 font-medium text-slate-900 hover:border-slate-400"
              >
                I have land to list
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demand-side value props — written as if the buyer is reading. */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ValueProp
            kicker="Demand-first"
            headline="Built for AI Data Center developers writing checks today."
            body="Hyperscalers, AI labs, and HPC operators source through Livio Land because every parcel comes with the data their underwriting team needs — not just a broker phone number."
          />
          <ValueProp
            kicker="Vetted supply"
            headline="Sites with MW, PPA status, interconnection stage on file."
            body="Every listing has photos, acreage, deliverable MW, signed-or-pending PPA price, and an LGIA / facility-study status. If a parcel doesn't have what your IC needs, you'll know before you click in."
          />
          <ValueProp
            kicker="MNDA-first"
            headline="Sellers sign MNDA + non-circumvention before they list."
            body="You can read site details without telling sellers what you're building. Every owner signed Livio's Mutual NDA + non-circumvention before getting on the platform — your buy plan stays your buy plan."
          />
          <ValueProp
            kicker="2% — at close only"
            headline="A success fee that doesn't show up in the LOI."
            body="Buyer-side success fee is 2% of total Transaction value, owed only when a definitive agreement is signed. Vs. 5–6% to a traditional broker. The supplier-side fee is a separate 2% on the seller — no double-charging."
          />
        </div>
      </section>

      {/* Two-sided. Buyer pitch is primary; landowner pitch frames Livio as
          the place buyers are already shopping (so listing here is the move
          even if you've never heard of us). */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white border-2 border-emerald-300 p-8 shadow-sm">
            <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Primary
            </span>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              For AI Data Center developers
            </h2>
            <p className="mt-2 text-slate-600">
              Stop sourcing through brokers and back-channel intros. Specify
              your MW, region, PPA price ceiling, and interconnection-stage
              requirements — Livio Land surfaces utility-ready parcels that
              already match.
            </p>
            <ul className="mt-6 space-y-3 text-slate-700">
              <Bullet>Filter by MW, state, PPA status, interconnection stage, water, fiber</Bullet>
              <Bullet>Read public Q&amp;A from other AI Data Center developers about each site</Bullet>
              <Bullet>Ask the questions that actually matter — water rights, zoning, energization timeline</Bullet>
              <Bullet>2% buyer-side success fee at close — paid only on a deal that goes through</Bullet>
            </ul>
            <Link
              href="/listings/land"
              className="mt-6 inline-block rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
            >
              Start sourcing sites
            </Link>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900">For landowners</h2>
            <p className="mt-2 text-slate-600">
              The AI Data Center developers and hyperscalers shopping on Livio
              Land are searching for parcels right now. Listing here puts your
              site directly in front of the buyers — without a broker taking
              5%.
            </p>
            <ul className="mt-6 space-y-3 text-slate-700">
              <Bullet>List acres, available MW, PPA status, interconnection stage</Bullet>
              <Bullet>Upload site photos, drone shots, surveys, utility LOIs</Bullet>
              <Bullet>Answer buyer questions publicly — build trust, save time on intros</Bullet>
              <Bullet>2% seller-side fee at close — the lowest in the market</Bullet>
            </ul>
            <Link
              href="/listings/new/land"
              className="mt-6 inline-block rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
            >
              List your land
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueProp({
  kicker,
  headline,
  body,
}: {
  kicker: string;
  headline: string;
  body: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {kicker}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-900 leading-snug">
        {headline}
      </div>
      <div className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-emerald-600 font-bold">✓</span>
      <span>{children}</span>
    </li>
  );
}
