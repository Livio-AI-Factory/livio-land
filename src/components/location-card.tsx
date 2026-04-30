import { ListingMap } from "./listing-map";

export function LocationCard({
  location,
  country,
  county,
  state,
  postalCode,
  streetAddress,
  latitude,
  longitude,
  isOwnerOrAdmin,
}: {
  location: string;
  country: string;
  county?: string | null;
  state?: string | null;
  postalCode?: string | null;
  streetAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isOwnerOrAdmin?: boolean;
}) {
  const hasCoords = latitude != null && longitude != null;
  const showStreet = isOwnerOrAdmin && streetAddress;

  // Build the maps query string
  const mapsQuery = encodeURIComponent(
    [
      streetAddress,
      location,
      county ? `${county} County` : null,
      state,
      postalCode,
    ]
      .filter(Boolean)
      .join(", ") || `${latitude},${longitude}`
  );
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps?q=${mapsQuery}`;

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-semibold text-slate-900">Location</h2>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-600 hover:underline"
        >
          Open in Google Maps →
        </a>
      </div>
      <ListingMap
        latitude={latitude}
        longitude={longitude}
        streetAddress={isOwnerOrAdmin ? streetAddress : null}
        county={county}
        state={state}
        postalCode={postalCode}
        location={location}
        country={country}
        className="mt-4"
      />
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <Stat label="City / Region" value={location} />
        <Stat label="State" value={state || "—"} />
        <Stat label="County" value={county || "—"} />
        <Stat label="ZIP" value={postalCode || "—"} />
        <Stat label="Country" value={country} />
        <Stat
          label="Coordinates"
          value={
            hasCoords ? `${latitude!.toFixed(4)}, ${longitude!.toFixed(4)}` : "—"
          }
        />
      </div>
      {showStreet && (
        <div className="mt-3 text-sm">
          <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
            Private — owner/admin only
          </span>
          <span className="ml-2 text-slate-700">{streetAddress}</span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-900 font-medium">{value}</div>
    </div>
  );
}
