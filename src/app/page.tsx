import Link from "next/link";

// Aligned with Livio Grid's design system (May 2026):
//   - Centered hero with eyebrow tag pills above the H1.
//   - Rounded-FULL CTAs and badges (no hairline rectangles).
//   - Soft cards with rainbow chip-stripe headers + big top-right numerals.
//   - Caption row with · separators under the primary CTA.
//   - Land keeps emerald (Grid is sky-blue) so the family is one design system
//     in two sub-brand colors. Same structural language, different accent.
//
// Original copy is preserved verbatim — only the chrome changes.

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <div>
      {/* HERO — centered, eyebrow tags above H1 */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[12px] font-medium text-emerald-800">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              01 / SOURCE
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-4 py-1.5 text-[12px] font-medium text-emerald-800">
              For AI Data Center developers · hyperscalers · AI labs · investors
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.02]">
            The fastest way to find your next{" "}
            <span className="text-emerald-600">AI Data Center site.</span>
          </h1>

          <p className="mt-8 mx-auto max-w-3xl text-lg leading-[1.55] text-neutral-700">
            Livio Land is the sourcing engine that puts utility-ready powered
            parcels in front of AI Data Center developers, hyperscalers, and AI
            labs. Tell us your MW, region, and timeline — get vetted,
            MNDA-protected sites with PPA status and interconnection stage on
            file, ready to underwrite.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/listings/land"
              className="rounded-full bg-emerald-700 px-7 py-3.5 text-[14px] font-medium text-white hover:bg-emerald-800 inline-flex items-center gap-2"
            >
              Source sites for my AI Data Center →
            </Link>
            <Link
              href="/list"
              className="rounded-full border border-neutral-300 bg-white px-7 py-3.5 text-[14px] font-medium text-neutral-800 hover:border-neutral-400 inline-flex items-center gap-2"
            >
              I have land to list ↗
            </Link>
          </div>

          <div className="mt-5 text-[12px] text-neutral-500">
            MNDA-protected · 2% buyer-side success fee · USA coverage · No subscription
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PromiseCard
              kicker="Time to first match"
              num="01"
              headline="< 10 min"
              body="to find your ideal powered land site."
              stripe="from-emerald-500 via-cyan-400 to-sky-500"
            />
            <PromiseCard
              kicker="With every site"
              num="02"
              headline="Feasibility report included."
              body="MW deliverability, PPA status, interconnection stage, water, fiber, zoning — packaged for your IC."
              stripe="from-purple-500 via-pink-400 to-orange-500"
            />
            <PromiseCard
              kicker="With every purchase"
              num="03"
              headline="Architectural rendering & CDs included."
              body="Construction documents and a site rendering ship with the close — straight to the GC."
              stripe="from-orange-500 via-yellow-400 to-emerald-500"
            />
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--color-rule)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-emerald-700 mb-3">
              02 / Why
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              The sourcing engine, not a marketplace.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <ValueCard
              icon="🎯"
              kicker="Demand-first"
              headline="Built for AI Data Center developers writing checks today."
              body="Hyperscalers, AI labs, and HPC operators source through Livio Land because every parcel comes with the data their underwriting team needs — not a broker phone number."
            />
            <ValueCard
              icon="✓"
              kicker="Vetted supply"
              headline="MW, PPA status, interconnection stage on file."
              body="Every listing has photos, acreage, deliverable MW, signed-or-pending PPA price, and an LGIA / facility-study status. If a parcel doesn't have what your IC needs, you'll know before you click in."
            />
            <ValueCard
              icon="🔒"
              kicker="MNDA-first"
              headline="Sellers sign MNDA + non-circumvention before they list."
              body="Read site details without telling sellers what you're building. Every owner signed Livio's Mutual NDA + non-circumvention before getting on the platform."
            />
            <ValueCard
              icon="💸"
              kicker="2% — at close"
              headline="A success fee that doesn't show up in the LOI."
              body="Buyer-side success fee is 2% of total Transaction value, owed only when a definitive agreement is signed. Vs. 5–6% to a traditional broker. Seller-side fee is a separate 2%."
            />
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--color-rule)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-emerald-700 mb-3">
              03 / How
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              For both sides of the deal.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-emerald-700 mb-3">
                Primary
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                For AI Data Center developers
              </h3>
              <p className="mt-4 text-[15px] leading-[1.6] text-neutral-700">
                Stop sourcing through brokers and back-channel intros. Specify
                your MW, region, PPA price ceiling, and interconnection-stage
                requirements — Livio Land surfaces utility-ready parcels that
                already match.
              </p>
              <ul className="mt-6 space-y-3 text-[14px] leading-[1.55] text-neutral-800">
                <Item>Filter by MW, state, PPA status, interconnection stage, water, fiber</Item>
                <Item>Read public Q&amp;A from other AI Data Center developers about each site</Item>
                <Item>Ask the questions that matter — water rights, zoning, energization timeline</Item>
                <Item>2% buyer-side success fee at close — paid only on a deal that goes through</Item>
              </ul>
              <Link
                href="/listings/land"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-[14px] font-medium text-white hover:bg-emerald-800"
              >
                Start sourcing sites →
              </Link>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-8">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-500 mb-3">
                Secondary
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                For landowners
              </h3>
              <p className="mt-4 text-[15px] leading-[1.6] text-neutral-700">
                The AI Data Center developers and hyperscalers shopping on Livio
                Land are searching for parcels right now. Listing here puts your
                site directly in front of the buyers — without a broker taking
                5%.
              </p>
              <ul className="mt-6 space-y-3 text-[14px] leading-[1.55] text-neutral-800">
                <Item>List acres, available MW, PPA status, interconnection stage</Item>
                <Item>Upload site photos, drone shots, surveys, utility LOIs</Item>
                <Item>Answer buyer questions publicly — build trust, save time on intros</Item>
                <Item>2% seller-side fee at close — the lowest in the market</Item>
              </ul>
              <Link
                href="/list"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-[14px] font-medium text-neutral-800 hover:border-neutral-400"
              >
                List your land ↗
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PromiseCard({
  kicker,
  num,
  headline,
  body,
  stripe,
}: {
  kicker: string;
  num: string;
  headline: string;
  body: string;
  stripe: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${stripe}`} />
      <div className="p-6 relative">
        <div className="absolute top-5 right-6 text-[14px] font-mono text-neutral-300">
          {num}
        </div>
        <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-emerald-700">
          {kicker}
        </div>
        <div className="mt-3 text-3xl md:text-4xl font-bold tracking-tight leading-[1.05]">
          {headline}
        </div>
        <div className="mt-3 text-[13px] leading-[1.55] text-neutral-700">{body}</div>
      </div>
    </div>
  );
}

function ValueCard({
  icon,
  kicker,
  headline,
  body,
}: {
  icon: string;
  kicker: string;
  headline: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
        {icon}
      </div>
      <div className="mt-4 text-[11px] uppercase tracking-[0.14em] font-semibold text-emerald-700">
        {kicker}
      </div>
      <div className="mt-2 text-[18px] font-semibold leading-snug text-[var(--color-text)]">
        {headline}
      </div>
      <div className="mt-3 text-[13px] leading-[1.6] text-neutral-600">{body}</div>
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
