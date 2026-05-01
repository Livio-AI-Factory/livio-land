import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { AdminListingRow } from "@/app/admin/listing-row";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  // Land-only marketplace: dropped the DC findMany queries entirely.
  const [landListings, questionsAsked, pendingLand] = await Promise.all([
    prisma.poweredLandListing.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { questions: true } } },
    }),
    prisma.question.findMany({
      where: { askerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        landListing: { select: { id: true, title: true } },
        answers: { take: 1 },
      },
    }),
    // Admin-only data — only fetched if isAdmin, otherwise empty arrays
    // so the dashboard of non-admins doesn't pay the cost.
    user.isAdmin
      ? prisma.poweredLandListing.findMany({
          where: { approvalStatus: "pending" },
          orderBy: { createdAt: "desc" },
          include: { owner: { select: { name: true, email: true, company: true } } },
        })
      : Promise.resolve([] as Array<never>),
  ]);
  const totalPending = pendingLand.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-slate-600">
            Manage your listings and stay on top of off-taker questions.
          </p>
        </div>
        <Link
          href="/listings/new/land"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + List land
        </Link>
      </div>

      {/* Admin-only: pending-review queue rendered inline on the dashboard so
          admins can approve/reject without navigating to /admin. Hidden from
          regular users entirely. */}
      {user.isAdmin && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Pending review
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {totalPending}
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                New listings waiting on your approval. Approved listings become visible to
                off-takers immediately.
              </p>
            </div>
            <Link
              href="/admin"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Open full admin queue →
            </Link>
          </div>

          {totalPending === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              Inbox zero — no pending listings.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
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
      )}

      {/* DC Capacity section retired — Livio Land is land-only. Old DC
          listings still exist in the schema but are hidden from the UI. */}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Your land listings ({landListings.length})
          </h2>
          <Link
            href="/listings/new/land"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            + Add land listing
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {landListings.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No land listed yet.
            </p>
          )}
          {landListings.map((l) => (
            <Link
              key={l.id}
              href={`/listings/land/${l.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">{l.title}</div>
                  <div className="text-sm text-slate-600">
                    {l.location} • {l.availableMW} MW • {l.acres} acres
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {l._count.questions}{" "}
                  {l._count.questions === 1 ? "question" : "questions"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {questionsAsked.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">
            Questions you've asked
          </h2>
          <div className="mt-4 grid gap-3">
            {questionsAsked.map((q) => {
              // Land-only marketplace: any DC questions in old data are
              // ignored from this dashboard view.
              const target = q.landListing;
              if (!target) return null;
              const path = `/listings/land/${q.landListingId}`;
              return (
                <Link
                  key={q.id}
                  href={path}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-500"
                >
                  <div className="text-sm text-slate-500">
                    On {target?.title}
                  </div>
                  <div className="mt-1 text-slate-900">{q.body}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    {q.answers.length > 0 ? "Answered" : "Awaiting reply"}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
