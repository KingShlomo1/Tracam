/**
 * Photo tips for places you might travel to.
 * Keyed by lowercase country name so we can match a reverse-geocoded country.
 */

export interface PlaceTips {
  country: string;
  emoji: string;
  tips: string[];
}

export const TIPS: Record<string, PlaceTips> = {
  thailand: {
    country: "Thailand",
    emoji: "🐘",
    tips: [
      "Elephants at an ethical sanctuary — get low for eye-level shots",
      "Golden temple roofs against a blue sky",
      "Colourful street-food stalls and sizzling woks at night",
      "Long-tail boats on turquoise water",
      "Floating markets full of fruit and paddle boats",
      "Monks in orange robes (ask before photographing people)",
    ],
  },
  japan: {
    country: "Japan",
    emoji: "🌸",
    tips: [
      "Cherry blossoms framing a quiet street",
      "Neon reflections in Tokyo puddles after rain",
      "A steaming bowl of ramen from above",
      "Torii gates receding into the distance",
      "Bullet train zipping past Mt. Fuji",
    ],
  },
  italy: {
    country: "Italy",
    emoji: "🍝",
    tips: [
      "Golden-hour light on old stone streets",
      "Fresh pasta or gelato, close up",
      "Laundry strung between colourful buildings",
      "A Vespa parked against a weathered wall",
      "Piazzas from a rooftop or bell tower",
    ],
  },
  france: {
    country: "France",
    emoji: "🥐",
    tips: [
      "The Eiffel Tower peeking between buildings",
      "A café table with a coffee and a croissant",
      "Lavender fields in soft light",
      "Cobbled Montmartre streets at dawn",
    ],
  },
  india: {
    country: "India",
    emoji: "🛕",
    tips: [
      "Bursts of colour at a spice or flower market",
      "The Taj Mahal reflected in its pools",
      "Rickshaws and busy street life in motion",
      "Intricate temple carvings up close",
    ],
  },
  indonesia: {
    country: "Indonesia",
    emoji: "🏝️",
    tips: [
      "Emerald rice terraces from a high angle",
      "Surfers and sunsets in Bali",
      "Temple gates wrapped in mist",
      "Fresh coconuts on the beach",
    ],
  },
  "united states": {
    country: "United States",
    emoji: "🗽",
    tips: [
      "Big landscapes in national parks",
      "City skylines at blue hour",
      "Classic diners and neon signs",
      "Road-trip shots from the open highway",
    ],
  },
  "united kingdom": {
    country: "United Kingdom",
    emoji: "☕",
    tips: [
      "Red phone boxes and double-decker buses",
      "Rolling green countryside and stone walls",
      "Historic pubs with hanging flower baskets",
      "Foggy morning views over a river",
    ],
  },
  greece: {
    country: "Greece",
    emoji: "🏛️",
    tips: [
      "White-and-blue houses against the sea",
      "Ancient ruins in golden light",
      "Sunsets over Santorini's caldera",
      "Cats lazing on sun-warmed steps",
    ],
  },
  spain: {
    country: "Spain",
    emoji: "🥘",
    tips: [
      "Gaudí's curves and colourful tiles",
      "Tapas spread on a wooden table",
      "Flamenco colour and movement",
      "Orange trees lining old plazas",
    ],
  },
};

export const DEFAULT_TIPS: PlaceTips = {
  country: "Wherever you are",
  emoji: "📸",
  tips: [
    "The little details — doorways, signs, textures",
    "Local food, right before your first bite",
    "The same view at sunrise and sunset",
    "A friendly face (always ask first)",
    "Something in soft red to match Tracam 🍓",
  ],
};

export function tipsForCountry(country?: string): PlaceTips {
  if (!country) return DEFAULT_TIPS;
  const match = TIPS[country.trim().toLowerCase()];
  return match ?? DEFAULT_TIPS;
}
