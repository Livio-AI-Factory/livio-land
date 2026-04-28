import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { createDcListing } from "@/lib/listing-actions";
import { ListingForm, FormField, FormSection } from "@/components/listing-form";

export default async function NewDcListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  return (
    <div className="mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-3xl font-bold text-slate-900">List DC Capacity</h1>
      <p className="mt-2 text-slate-600">
        Off-takers will see these details when they search. The more complete
        the spec, the better the matches.
      </p>
      <div className="mt-8">
        <ListingForm action={createDcListing} submitLabel="Publish listing">
          <FormSection title="Overview">
            <FormField name="title" label="Listing title" required placeholder="50MW available — Northern Virginia colo" />
            <div className="grid grid-cols-2 gap-4">
              <FormField name="location" label="Location" required placeholder="Ashburn, VA" />
              <FormField name="country" label="Country" defaultValue="USA" />
            </div>
            <FormField
              name="description"
              label="Description"
              type="textarea"
              placeholder="Tell off-takers about the facility, current tenants, expansion plans, etc."
            />
          </FormSection>

          <FormSection title="Capacity & Availability">
            <div className="grid grid-cols-2 gap-4">
              <FormField name="totalCapacityMW" label="Total facility MW" type="number" step="0.1" required />
              <FormField name="availableMW" label="Available MW" type="number" step="0.1" required />
            </div>
            <FormField name="availabilityDate" label="Available from" type="date" required />
          </FormSection>

          <FormSection title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <FormField name="ratePerKWh" label="Rate ($/kWh)" type="number" step="0.001" placeholder="0.085" />
              <FormField name="pricingModel" label="Pricing model" type="select" options={[
                { value: "per-kWh", label: "Per kWh" },
                { value: "per-kW-month", label: "Per kW per month" },
                { value: "custom", label: "Custom / negotiated" },
              ]} />
            </div>
            <FormField name="contractMinYears" label="Min contract term (years)" type="number" placeholder="5" />
          </FormSection>

          <FormSection title="Technical Specs">
            <div className="grid grid-cols-2 gap-4">
              <FormField name="tier" label="Tier" type="select" options={[
                { value: "", label: "—" },
                { value: "Tier I", label: "Tier I" },
                { value: "Tier II", label: "Tier II" },
                { value: "Tier III", label: "Tier III" },
                { value: "Tier IV", label: "Tier IV" },
              ]} />
              <FormField name="pue" label="PUE" type="number" step="0.01" placeholder="1.35" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField name="coolingType" label="Cooling" type="select" options={[
                { value: "", label: "—" },
                { value: "air", label: "Air" },
                { value: "liquid", label: "Liquid" },
                { value: "immersion", label: "Immersion" },
                { value: "hybrid", label: "Hybrid" },
              ]} />
              <FormField name="powerDensityKWPerRack" label="Density (kW / rack)" type="number" step="0.5" placeholder="20" />
            </div>
            <FormField name="network" label="Network / Carriers" placeholder="Cogent, Lumen, Zayo, AWS Direct Connect" />
            <FormField name="certifications" label="Certifications" placeholder="SOC 2, ISO 27001, HIPAA" />
          </FormSection>
        </ListingForm>
      </div>
    </div>
  );
}
