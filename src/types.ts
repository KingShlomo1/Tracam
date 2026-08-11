export interface Photo {
  id: string;
  /** Base64 data URL of the (compressed) image. */
  image: string;
  lat: number;
  lng: number;
  /** Human readable place, e.g. "Chiang Mai, Thailand". Filled in when we can. */
  place?: string;
  /** ISO country name when known, e.g. "Thailand". Used to match tips. */
  country?: string;
  caption?: string;
  /** Epoch millis. */
  takenAt: number;
  /** Animal kinds detected in the photo, e.g. ["elephant"]. Empty = none found. */
  animals?: string[];
  /** True once we've run animal detection (so we don't re-scan forever). */
  scanned?: boolean;
}

export interface Home {
  lat: number;
  lng: number;
  name: string;
}

export type TabId = "map" | "camera" | "gallery" | "tips";
