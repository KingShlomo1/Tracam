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
