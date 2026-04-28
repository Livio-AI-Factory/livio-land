import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { QAndA } from "@/components/q-and-a";

export default async function LandListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await prisma.poweredLandListing.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, company: true } },
      questions: {
        orderBy: { createdAt: "desc" },
        include: {
          asker: { select: { name: true, company: true } },
          answers: {
            orderBy: { createdAt: "asc" },
            include: { responder: { select: { name: true, company: true } } },
          },
        },
      },
    },
  });

  if (!listing) notFound();
  const user = await getCurrentUser();
  const isOwner = user?.id === listing.ownerId;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/listings/land" className="text-sm text-brand-600 hover:underline">
        ← Back to powered land
      </Link>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Powered Land
            </span>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{listing.title}</h1>
            <p className="text-slate-600">{listing.location}, {listing.country}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <div>Listed by</div>
            <div className="font-medium text-slate-900">
              {listing.owner.company || listing.owner.name}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200 pt-6">
          <Stat label="Power" value={`${listing.availableMW} MW`} highlight />
          <Stat label="Acres" value={`${listing.acres}`} />
          <Stat label="Deal" value={listing.pricingModel} />
          <Stat
            label="Asking"
            value={
              listing.askingPrice
                ? `$${listing.askingPrice.toLocaleString()}`
                : "On request"
            }
          />
        </div>

        {listing.description && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h2 className="font-semibold text-slate-900">About</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">
              {listing.description}
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 pt-6">
          <h2 className="font-semibold text-slate-900">Power & Interconnection</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat label="Utility / ISO" value={listing.utilityProvider || "—"} />
            <Stat
              label="Substation"
              value={
                listing.substationDistanceMiles != null
                  ? `${listing.substationDistanceMiles} mi`
                  : "—"
              }
            />
            <Stat label="Interconnection" value={listing.interconnectionStage || "—"} />
            <Stat label="PPA status" value={listing.ppaStatus || "—"} />
            <Stat
              label="PPA price"
              value={
                listing.ppaPricePerMWh ? `$${listing.ppaPricePerMWh}/MWh` : "—"
              }
            />
            <Stat
              label="Energization"
              value={
                listing.expectedEnergization
                  ? new Date(listing.expectedEnergization).toLocaleDateString()
                  : "—"
              }
            />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <h2 className="font-semibold text-slate-900">Site Conditions</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat label="Water" value={listing.waterAvailable || "—"} />
            <Stat label="Fiber" value={listing.fiberAvailable || "—"} />
            <Stat label="Zoning" value={listing.zoning || "—"} />
          </div>
          {listing.waterSourceNotes && (
            <p className="mt-3 text-sm text-slate-700">
              <span className="font-medium">Water notes: </span>
              {listing.waterSourceNotes}
            </p>
          )}
        </div>
      </div>

      <QAndA
        listingType="land"
        listingId={listing.id}
        listingOwnerId={listing.ownerId}
        questions={listing.questions}
        currentUser={user}
        isOwner={isOwner}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div
        className={
          highlight
            ? "text-xl font-bold text-emerald-700"
            : "text-base font-medium text-slate-900"
        }
      >
        {value}
      </div>
    </div>
  );
}
