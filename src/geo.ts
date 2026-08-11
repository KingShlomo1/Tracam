/** Small helpers for location + reverse geocoding. */

export interface Coords {
  lat: number;
  lng: number;
}

/** Ask the browser for the current position. Resolves null if unavailable/denied. */
export function getCurrentPosition(): Promise<Coords | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

/** Great-circle distance between two points, in kilometres. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
}

/**
 * Forward-geocode a search string (e.g. "Israel", "Kyoto") into a few candidate
 * places using the free OpenStreetMap Nominatim service. Returns [] on failure.
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2` +
      `&limit=6&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => ({
      name: d.display_name as string,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }));
  } catch {
    return [];
  }
}

export interface PlaceInfo {
  place?: string;
  country?: string;
}

/**
 * Reverse-geocode coordinates to a place + country using the free
 * OpenStreetMap Nominatim service. Fails gracefully (returns {}).
 */
export async function reverseGeocode(coords: Coords): Promise<PlaceInfo> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${coords.lat}&lon=${coords.lng}&zoom=10`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const a = data.address ?? {};
    const city =
      a.city || a.town || a.village || a.county || a.state || undefined;
    const country: string | undefined = a.country;
    const place = [city, country].filter(Boolean).join(", ") || undefined;
    return { place, country };
  } catch {
    return {};
  }
}
