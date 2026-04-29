import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { createLandListing } from "@/lib/listing-actions";
import { ListingForm, FormField, FormSection } from "@/components/listing-form";

export default async function NewLandListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  return (
    <div className="mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-3xl font-bold text-slate-900">List Powered Land</h1>
      <p className="mt-2 text-slate-600">
        Help off-takers evaluate your site quickly. Interconnection and PPA
        status are usually their first questions.
      </p>
      <div className="mt-8">
        <ListingForm action={createLandListing} submitLabel="Publish listing">
          <FormSection title="Overview">
            <FormField name="title" label="Listing title" required placeholder="200MW greenfield site — West Texas" />
            <div className="grid grid-cols-2 gap-4">
              <FormField name="location" label="Location" required placeholder="Abilene, TX" />
              <FormField name="country" label="Country" defaultValue="USA" />
            </div>
            <FormField
              name="description"
              label="Description"
              type="textarea"
              placeholder="Site context: grid topology, load zone, rail/highway access, climate, etc."
            />
          </FormSection>

          <FormSection title="Site Location">
            <FormField name="streetAddress" label="Street address (private — used for due diligence only)" placeholder="" />
            <div className="grid grid-cols-2 gap-4">
              <FormField name="county" label="County" placeholder="Taylor" />
              <FormField name="state" label="State" placeholder="TX" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField name="postalCode" label="ZIP" placeholder="79601" />
              <FormField name="latitude" label="Latitude" type="number" step="0.000001" placeholder="32.4487" />
              <FormField name="longitude" label="Longitude" type="number" step="0.000001" placeholder="-99.7331" />
            </div>
          </FormSection>

          <FormSection title="Land & Power">
            <div className="grid grid-cols-2 gap-4">
              <FormField name="acres" label="Acres" type="number" step="0.1" required />
              <FormField name="availableMW" label="Available MW" type="number" step="0.1" required />
            </div>
            <FormField name="utilityProvider" label="Utility / ISO" placeholder="ERCOT — Oncor" />
            <FormField name="substationDistanceMiles" label="Distance to nearest substation (miles)" type="number" step="0.1" />
          </FormSection>

          <FormSection title="PPA & Interconnection">
            <div className="grid grid-cols-2 gap-4">
              <FormField name="ppaStatus" label="PPA status" type="select" options={[
                { value: "", label: "—" },
                { value: "signed", label: "Signed" },
                { value: "in-negotiation", label: "In negotiation" },
                { value: "available", label: "Available (not yet pursued)" },
                { value: "none", label: "None" },
              ]} />
              <FormField name="ppaPricePerMWh" label="PPA price ($/MWh)" type="number" step="0.01" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField name="interconnectionStage" label="Interconnection stage" type="select" options={[
                { value: "", label: "—" },
                { value: "study", label: "Feasibility study" },
                { value: "facility-study", label: "Facility study" },
                { value: "LGIA", label: "LGIA executed" },
                { value: "energized", label: "Energized" },
              ]} />
              <FormField name="expectedEnergization" label="Expected energization" type="date" />
            </div>
          </FormSection>

          <FormSection title="Site Conditions">
            <div className="grid grid-cols-2 gap-4">
              <FormField name="waterAvailable" label="Water available" type="select" options={[
                { value: "", label: "—" },
                { value: "yes", label: "Yes" },
                { value: "limited", label: "Limited" },
                { value: "no", label: "No" },
                { value: "unknown", label: "Unknown" },
              ]} />
              <FormField name="fiberAvailable" label="Fiber" type="select" options={[
                { value: "", label: "—" },
                { value: "yes", label: "On site" },
                { value: "near", label: "Nearby" },
                { value: "no", label: "None" },
                { value: "unknown", label: "Unknown" },
              ]} />
            </div>
            <FormField name="waterSourceNotes" label="Water source notes" placeholder="Municipal connection ~2mi; aquifer rights conveyed with land" />
            <FormField name="zoning" label="Zoning" placeholder="Heavy industrial (M-2)" />
          </FormSection>

          <FormSection title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <FormField name="askingPrice" label="Asking price ($)" type="number" step="1000" />
              <FormField name="pricingModel" label="Deal structure" type="select" options={[
                { value: "sale", label: "Sale" },
                { value: "lease", label: "Lease" },
                { value: "JV", label: "Joint venture" },
              ]} />
            </div>
          </FormSection>
        </ListingForm>
      </div>
    </div>
  );
}
