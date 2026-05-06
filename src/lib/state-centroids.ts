// Approximate geographic centroids for each US state, used to plot land
// listings on a map without needing per-listing lat/long. Coordinates are
// rough (visual approximation only — never used for search radius or
// distance calculations).
//
// Source: Wikipedia "List of geographic centers of the United States",
// rounded to 4 decimals. If we ever ship per-listing lat/long via Google
// Geocoding, this file becomes a fallback for listings that haven't been
// geocoded yet.

export const STATE_CENTROIDS: Record<string, { lat: number; lng: number; name: string }> = {
  AL: { lat: 32.7794, lng: -86.8287, name: "Alabama" },
  AK: { lat: 64.0685, lng: -152.2782, name: "Alaska" },
  AZ: { lat: 34.2744, lng: -111.6602, name: "Arizona" },
  AR: { lat: 34.8938, lng: -92.4426, name: "Arkansas" },
  CA: { lat: 37.1841, lng: -119.4696, name: "California" },
  CO: { lat: 38.9972, lng: -105.5478, name: "Colorado" },
  CT: { lat: 41.6219, lng: -72.7273, name: "Connecticut" },
  DE: { lat: 38.9896, lng: -75.5050, name: "Delaware" },
  FL: { lat: 28.6305, lng: -82.4497, name: "Florida" },
  GA: { lat: 32.6415, lng: -83.4426, name: "Georgia" },
  HI: { lat: 20.2927, lng: -156.3737, name: "Hawaii" },
  ID: { lat: 44.3509, lng: -114.6130, name: "Idaho" },
  IL: { lat: 40.0417, lng: -89.1965, name: "Illinois" },
  IN: { lat: 39.8942, lng: -86.2816, name: "Indiana" },
  IA: { lat: 42.0751, lng: -93.4960, name: "Iowa" },
  KS: { lat: 38.4937, lng: -98.3804, name: "Kansas" },
  KY: { lat: 37.5347, lng: -85.3021, name: "Kentucky" },
  LA: { lat: 31.0689, lng: -91.9968, name: "Louisiana" },
  ME: { lat: 45.3695, lng: -69.2428, name: "Maine" },
  MD: { lat: 39.0550, lng: -76.7909, name: "Maryland" },
  MA: { lat: 42.2596, lng: -71.8083, name: "Massachusetts" },
  MI: { lat: 44.3467, lng: -85.4102, name: "Michigan" },
  MN: { lat: 46.2807, lng: -94.3053, name: "Minnesota" },
  MS: { lat: 32.7364, lng: -89.6678, name: "Mississippi" },
  MO: { lat: 38.3566, lng: -92.4580, name: "Missouri" },
  MT: { lat: 47.0527, lng: -109.6333, name: "Montana" },
  NE: { lat: 41.5378, lng: -99.7951, name: "Nebraska" },
  NV: { lat: 39.3289, lng: -116.6312, name: "Nevada" },
  NH: { lat: 43.6805, lng: -71.5811, name: "New Hampshire" },
  NJ: { lat: 40.1907, lng: -74.6728, name: "New Jersey" },
  NM: { lat: 34.4071, lng: -106.1126, name: "New Mexico" },
  NY: { lat: 42.9538, lng: -75.5268, name: "New York" },
  NC: { lat: 35.5557, lng: -79.3877, name: "North Carolina" },
  ND: { lat: 47.4501, lng: -100.4659, name: "North Dakota" },
  OH: { lat: 40.2862, lng: -82.7937, name: "Ohio" },
  OK: { lat: 35.5889, lng: -97.4943, name: "Oklahoma" },
  OR: { lat: 43.9336, lng: -120.5583, name: "Oregon" },
  PA: { lat: 40.8781, lng: -77.7996, name: "Pennsylvania" },
  RI: { lat: 41.6772, lng: -71.5101, name: "Rhode Island" },
  SC: { lat: 33.9169, lng: -80.8964, name: "South Carolina" },
  SD: { lat: 44.4443, lng: -100.2263, name: "South Dakota" },
  TN: { lat: 35.8580, lng: -86.3505, name: "Tennessee" },
  TX: { lat: 31.4757, lng: -99.3312, name: "Texas" },
  UT: { lat: 39.3055, lng: -111.6703, name: "Utah" },
  VT: { lat: 44.0687, lng: -72.6658, name: "Vermont" },
  VA: { lat: 37.5215, lng: -78.8537, name: "Virginia" },
  WA: { lat: 47.3826, lng: -120.4472, name: "Washington" },
  WV: { lat: 38.6409, lng: -80.6227, name: "West Virginia" },
  WI: { lat: 44.6243, lng: -89.9941, name: "Wisconsin" },
  WY: { lat: 42.9957, lng: -107.5512, name: "Wyoming" },
  DC: { lat: 38.9072, lng: -77.0369, name: "District of Columbia" },
};

/** Return [lat, lng] for a 2-letter state code, or null if not recognized. */
export function centroidForState(state: string | null | undefined): { lat: number; lng: number } | null {
  if (!state) return null;
  const c = STATE_CENTROIDS[state.toUpperCase()];
  if (!c) return null;
  return { lat: c.lat, lng: c.lng };
}

/**
 * Spread overlapping markers slightly so multiple listings in the same
 * state don't stack on a single pin. We add a small deterministic jitter
 * based on the listing id so positions are stable across renders.
 */
export function jitterPin(
  base: { lat: number; lng: number },
  seed: string,
): { lat: number; lng: number } {
  // Simple string hash → two small offsets in degrees.
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const jitterLat = ((h & 0xffff) / 0xffff - 0.5) * 1.2; // ±0.6°
  const jitterLng = (((h >>> 16) & 0xffff) / 0xffff - 0.5) * 1.2;
  return { lat: base.lat + jitterLat, lng: base.lng + jitterLng };
}
