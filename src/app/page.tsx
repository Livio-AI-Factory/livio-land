import Link from "next/link";

// Livio Land is the marketplace for powered land. Site-wide pivot: DC-capacity
// listings retired, all flows route to the land creation experience.
//
// The stats tiles used to show literal counts (1 DC listing, 0 Land listings,
// etc.) which read as "abandoned site" while we're early. Replaced with
// truthful value-prop tiles that explain why a supplier or off-taker would
// use Livio Land vs going through a traditional broker.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-gradient border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
              ⚡ The marketplace for powered land
            </span>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-900">
              The fastest way to find{" "}
              <span className="text-emerald-600">powered land</span> for data
              centers.
            </h1>
            <p className="mt-4 text-xl text-slate-700">
              Livio Land connects landowners with utility-ready acreage to the
              hyperscalers, AI labs, and HPC operators actively shopping for
              MW. Skip the brokers. Skip the cold outreach. Get in front of the
              people building.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/listings/land"
                className="rounded-md bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
              >
                Browse powered land
              </Link>
              <Link
                href="/listings/new/land"
                className="rounded-md border border-slate-300 bg-white px-5 py-3 font-medium text-slate-900 hover:border-slate-400"
              >
                List your land →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value props (replaces literal stats — read better when listing
          counts are still small and avoid the "ghost town" effect). */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ValueProp
            kicker="Direct"
            headline="A network of data center developers actively sourcing land."
            body="Hyperscalers, AI labs, and HPC operators see your parcel — not a re-listing through three brokers."
          />
          <ValueProp
            kicker="Fast"
            headline="From listed to in front of off-takers in minutes."
            body="Drop your photos, MW, PPA status, and interconnection stage. Off-takers can search by exactly that."
          />
          <ValueProp
            kicker="2% per side"
            headline="A fee that doesn't eat your deal."
            body="Traditional broker commissions run 5–6%, paid by the seller. Livio splits 2% from the buyer + 2% from the seller — only collected when a deal closes through the platform."
          />
          <ValueProp
            kicker="Protected"
            headline="MNDA + non-circumvention before any contact."
            body="Every off-taker who messages you has signed Livio's mutual NDA. Going around the platform on a deal sourced here = liquidated damages of 8% of deal value plus legal fees."
          />
        </div>
      </section>

      {/* Two-sided */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900">For landowners</h2>
            <p className="mt-2 text-slate-600">
              Sitting on a parcel with a substation nearby, signed PPA, or LGIA
              executed? Get it in front of buyers actively writing checks for
              MW — without giving up 5% of the deal to a broker.
            </p>
            <ul className="mt-6 space-y-3 text-slate-700">
              <Bullet>List acres, available MW, PPA status, interconnection stage</Bullet>
              <Bullet>Upload site photos, drone shots, surveys, utility LOIs</Bullet>
              <Bullet>Answer buyer questions publicly — build trust, save time</Bullet>
              <Bullet>2% fee at close — the lowest in the market</Bullet>
            </ul>
            <Link
              href="/listings/new/land"
              className="mt-6 inline-block rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
            >
              List your land
            </Link>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900">For data center developers</h2>
            <p className="mt-2 text-slate-600">
              Stop sourcing through brokers and back-channel intros. Find
              utility-ready parcels that match your MW, region, and
              interconnection-stage requirements in minutes.
            </p>
            <ul className="mt-6 space-y-3 text-slate-700">
              <Bullet>Filter by MW, state, PPA status, interconnection stage</Bullet>
              <Bullet>Read public Q&amp;A from other off-takers about each site</Bullet>
              <Bullet>Ask the questions that actually matter — water, fiber, zoning</Bullet>
              <Bullet>2% buyer-side fee at close, paid only on a successful match</Bullet>
            </ul>
            <Link
              href="/listings/land"
              className="mt-6 inline-block rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
            >
              Start searching
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
