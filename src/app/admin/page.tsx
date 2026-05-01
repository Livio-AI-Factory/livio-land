import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AdminListingRow } from "./listing-row";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin?next=/admin");
  if (!user.isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Admin only</h1>
        <p className="mt-2 text-sm text-slate-500">
          You need admin access to view this page. Ask Nav or Ethan to flip your isAdmin flag.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          ← Back home
        </Link>
      </div>
    );
  }

  // Land-only marketplace — DC pending queue retired.
  const [pendingLand, landCounts, mndaSignatures] = await Promise.all([
    prisma.poweredLandListing.findMany({
      where: { approvalStatus: "pending" },
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { name: true, email: true, company: true } } },
    }),
    prisma.poweredLandListing.groupBy({ by: ["approvalStatus"], _count: true }),
    prisma.mndaSignature.count(),
  ]);

  const sumByStatus = (rows: { approvalStatus: string; _count: number }[]) =>
    rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.approvalStatus]: r._count }), {});
  const land = sumByStatus(landCounts);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Admin</h1>
      <p className="mt-1 text-sm text-slate-500">
        Approve or reject new land listings. Approved listings become visible to off-takers.
      </p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Pending review" value={land.pending || 0} accent="amber" />
        <Stat label="Approved listings" value={land.approved || 0} accent="emerald" />
        <Stat label="Rejected" value={land.rejected || 0} accent="slate" />
        <Stat label="MNDAs on file" value={mndaSignatures} accent="brand" />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          Pending powered land ({pendingLand.length})
        </h2>
        {pendingLand.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing to review here.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {pendingLand.map((l) => (
              <AdminListingRow
                key={l.id}
                type="land"
                id={l.id}
                title={l.title}
                location={l.location}
                ownerName={l.owner.name}
                ownerEmail={l.owner.email}
                ownerCompany={l.owner.company || ""}
                createdAt={l.createdAt.toISOString()}
                summary={`${l.availableMW} MW · ${l.acres} acres · PPA ${l.ppaStatus ?? "—"} · ${l.interconnectionStage ?? "—"}`}
                description={l.description || ""}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "amber" | "emerald" | "slate" | "brand";
}) {
  const accentClasses: Record<typeof accent, string> = {
    amber: "text-amber-700",
    emerald: "text-emerald-700",
    slate: "text-slate-700",
    brand: "text-brand-700",
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className={`text-2xl font-bold ${accentClasses[accent]}`}>{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
