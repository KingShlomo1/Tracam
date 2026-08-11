import type { Home, Photo, Trail } from "./types";

const KEY = "tracam.photos.v1";
const CHALLENGE_KEY = "tracam.challenges.v1";
const HOME_KEY = "tracam.home.v1";
const TRAILS_KEY = "tracam.trails.v1";

/** Default home if the traveller hasn't set one yet: Israel. */
export const DEFAULT_HOME: Home = {
  lat: 31.4461,
  lng: 35.0,
  name: "Israel",
};

export function loadPhotos(): Photo[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Photo[]) : [];
  } catch {
    return [];
  }
}

export function savePhotos(photos: Photo[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(photos));
  } catch (err) {
    // Most likely the localStorage quota is full.
    console.warn("Could not save photos", err);
    alert(
      "Tracam ran out of storage space on this device. Try removing a few older photos."
    );
  }
}

export function loadDoneChallenges(): string[] {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function saveDoneChallenges(ids: string[]): void {
  try {
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function loadHome(): Home {
  try {
    const raw = localStorage.getItem(HOME_KEY);
    if (!raw) return DEFAULT_HOME;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number"
    ) {
      return parsed as Home;
    }
    return DEFAULT_HOME;
  } catch {
    return DEFAULT_HOME;
  }
}

export function saveHome(home: Home): void {
  try {
    localStorage.setItem(HOME_KEY, JSON.stringify(home));
  } catch {
    /* ignore */
  }
}

export function loadTrails(): Trail[] {
  try {
    const raw = localStorage.getItem(TRAILS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Trail[]) : [];
  } catch {
    return [];
  }
}

export function saveTrails(trails: Trail[]): void {
  try {
    localStorage.setItem(TRAILS_KEY, JSON.stringify(trails));
  } catch {
    /* ignore */
  }
}
