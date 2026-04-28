import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { updateLandListing } from "@/lib/listing-actions";
import { ListingForm, FormField, FormSection } from "@/components/listing-form";

export default async function EditLandListingPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");
  const listing = await prisma.poweredLandListing.findUnique({
    where: { id: params.id },
  });
  if (!listing) notFound();
  if (listing.ownerId !== user.id && !user.isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-16 px-4">
        <h1 className="text-2xl font-bold text-slate-900">Not allowed</h1>
        <p className="mt-2 text-slate-600">
          Only the listing owner or an administrator can edit this listing.
        </p>
        <Link
          href={`/listings/land/${listing.id}`}
          className="mt-4 inline-block text-brand-600 hover:underline"
        >
          ← Back to listing
        </Link>
      </div>
    );
  }
  const update = updateLandListing.bind(null, listing.id);
  const isoDate = (d: Date | null | undefined) =>
    d ? new Date(d).toISOString().slice(0, 10) : "";

  return (
    <div className="mx-auto max-w-3xl py-10 px-4">
      <Link
        href={`/listings/land/${listing.id}`}
        className="text-sm text-brand-600 hover:underline"
      >
        ← Back to listing
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Edit Land Listing</h1>
      <p className="mt-2 text-slate-600">
        {user.isAdmin && listing.ownerId !== user.id ? (
          <span className="rounded-md bg-red-50 px-2 py-0.5 text-sm text-red-700">
            Admin edit
          </span>
        ) : (
          "Update the details below. Off-takers will see your changes immediately."
        )}
      </p>
      <div className="mt-8">
        <ListingForm action={update} submitLabel="Save changes">
          <FormSection title="Overview">
            <FormField
              name="title"
              label="Listing title"
              required
              defaultValue={listing.title}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="location"
                label="Location"
                required
                defaultValue={listing.location}
              />
              <FormField
                name="country"
                label="Country"
                defaultValue={listing.country}
              />
            </div>
            <FormField
              name="description"
              label="Description"
              type="textarea"
              defaultValue={listing.description ?? ""}
            />
          </FormSection>

          <FormSection title="Land & Power">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="acres"
                label="Acres"
                type="number"
                step="0.1"
                required
                defaultValue={String(listing.acres)}
              />
              <FormField
                name="availableMW"
                label="Available MW"
                type="number"
                step="0.1"
                required
                defaultValue={String(listing.availableMW)}
              />
            </div>
            <FormField
              name="utilityProvider"
              label="Utility / ISO"
              defaultValue={listing.utilityProvider ?? ""}
            />
            <FormField
              name="substationDistanceMiles"
              label="Distance to nearest substation (miles)"
              type="number"
              step="0.1"
              defaultValue={listing.substationDistanceMiles != null ? String(listing.substationDistanceMiles) : ""}
            />
          </FormSection>

          <FormSection title="PPA & Interconnection">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="ppaStatus"
                label="PPA status"
                type="select"
                defaultValue={listing.ppaStatus ?? ""}
                options={[
                  { value: "", label: "—" },
                  { value: "signed", label: "Signed" },
                  { value: "in-negotiation", label: "In negotiation" },
                  { value: "available", label: "Available (not yet pursued)" },
                  { value: "none", label: "None" },
                ]}
              />
              <FormField
                name="ppaPricePerMWh"
                label="PPA price ($/MWh)"
                type="number"
                step="0.01"
                defaultValue={listing.ppaPricePerMWh != null ? String(listing.ppaPricePerMWh) : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="interconnectionStage"
                label="Interconnection stage"
                type="select"
                defaultValue={listing.interconnectionStage ?? ""}
                options={[
                  { value: "", label: "—" },
                  { value: "study", label: "Feasibility study" },
                  { value: "facility-study", label: "Facility study" },
                  { value: "LGIA", label: "LGIA executed" },
                  { value: "energized", label: "Energized" },
                ]}
              />
              <FormField
                name="expectedEnergization"
                label="Expected energization"
                type="date"
                defaultValue={isoDate(listing.expectedEnergization)}
              />
            </div>
          </FormSection>

          <FormSection title="Site Conditions">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="waterAvailable"
                label="Water available"
                type="select"
                defaultValue={listing.waterAvailable ?? ""}
                options={[
                  { value: "", label: "—" },
                  { value: "yes", label: "Yes" },
                  { value: "limited", label: "Limited" },
                  { value: "no", label: "No" },
                  { value: "unknown", label: "Unknown" },
                ]}
              />
              <FormField
                name="fiberAvailable"
                label="Fiber"
                type="select"
                defaultValue={listing.fiberAvailable ?? ""}
                options={[
                  { value: "", label: "—" },
                  { value: "yes", label: "On site" },
                  { value: "near", label: "Nearby" },
                  { value: "no", label: "None" },
                  { value: "unknown", label: "Unknown" },
                ]}
              />
            </div>
            <FormField
              name="waterSourceNotes"
              label="Water source notes"
              defaultValue={listing.waterSourceNotes ?? ""}
            />
            <FormField
              name="zoning"
              label="Zoning"
              defaultValue={listing.zoning ?? ""}
            />
          </FormSection>

          <FormSection title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="askingPrice"
                label="Asking price ($)"
                type="number"
                step="1000"
                defaultValue={listing.askingPrice != null ? String(listing.askingPrice) : ""}
              />
              <FormField
                name="pricingModel"
                label="Deal structure"
                type="select"
                defaultValue={listing.pricingModel}
                options={[
                  { value: "sale", label: "Sale" },
                  { value: "lease", label: "Lease" },
                  { value: "JV", label: "Joint venture" },
                ]}
              />
            </div>
          </FormSection>
        </ListingForm>
      </div>
    </div>
  );
}
