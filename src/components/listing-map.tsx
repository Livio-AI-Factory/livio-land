// Embedded Google Maps for a listing's location.
// Uses the Maps Embed API (no JS SDK needed) so it works as a server component
// and doesn't require the user's browser to load the heavy Maps JS library.
//
// Two display modes:
// - Coordinates available → satellite-view map centered on the parcel.
// - Only address available → search-mode map for the address string.
// Falls back to a static "Open in Google Maps" link if no API key is configured.

import Link from "next/link";

type Props = {
  latitude?: number | null;
  longitude?: number | null;
  streetAddress?: string | null;
  county?: string | null;
  state?: string | null;
  postalCode?: string | null;
  location: string;
  country?: string;
  className?: string;
  zoom?: number;
};

export function ListingMap(props: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { latitude, longitude, streetAddress, county, state, postalCode, location, country, zoom = 16 } = props;

  // Build the human-readable address for both display + Maps queries.
  const addressParts = [streetAddress, location, county, state, postalCode, country || "USA"]
    .filter(Boolean)
    .join(", ");

  const externalHref = latitude && longitude
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts)}`;

  if (!apiKey) {
    return (
      <div className={`rounded-lg border border-slate-200 bg-slate-50 p-4 ${props.className || ""}`}>
        <p className="text-sm text-slate-600">
          Map preview requires a Google Maps API key. Configure{" "}
          <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          in Railway env vars.
        </p>
        <Link
          href={externalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          Open in Google Maps →
        </Link>
      </div>
    );
  }

  let src: string;
  if (latitude && longitude) {
    // View mode with exact coordinates and satellite imagery.
    const params = new URLSearchParams({
      key: apiKey,
      center: `${latitude},${longitude}`,
      zoom: String(zoom),
      maptype: "satellite",
    });
    src = `https://www.google.com/maps/embed/v1/view?${params.toString()}`;
  } else {
    // Search mode for the address.
    const params = new URLSearchParams({
      key: apiKey,
      q: addressParts,
    });
    src = `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${props.className || ""}`}>
      <iframe
        title={`Map of ${location}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="block w-full h-[360px] border-0"
      />
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2 text-xs text-slate-600">
        <span>{addressParts || location}</span>
        <Link
          href={externalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 hover:underline shrink-0"
        >
          Open in Google Maps ↗
        </Link>
      </div>
    </div>
  );
}
