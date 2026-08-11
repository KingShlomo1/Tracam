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
}

export type TabId = "map" | "camera" | "gallery" | "tips";
