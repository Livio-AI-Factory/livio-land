import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function NewListingChooser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  return (
    <div className="mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-3xl font-bold text-slate-900">What are you listing?</h1>
      <p className="mt-2 text-slate-600">
        Pick the type of asset you want off-takers to find.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/listings/new/dc"
          className="group rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-500 hover:shadow-md transition"
        >
          <div className="text-2xl">⚡</div>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 group-hover:text-brand-600">
            Data Center Capacity
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            List MW of available capacity in an existing or under-construction
            facility. Specs: tier, PUE, cooling, network, rate.
          </p>
        </Link>
        <Link
          href="/listings/new/land"
          className="group rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-500 hover:shadow-md transition"
        >
          <div className="text-2xl">🏞️</div>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 group-hover:text-brand-600">
            Powered Land
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            List a parcel with available power. Specs: acres, MW, PPA status,
            interconnection stage, water, fiber.
          </p>
        </Link>
      </div>
    </div>
  );
}
