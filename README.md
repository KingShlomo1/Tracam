# 🍓 Tracam

A soft, simple little travel camera. Snap photos on your trip and Tracam pins
each one to a map where you took it — plus gentle tips on what to photograph and
a playful photo-challenge checklist.

Everything is white and light soft red, and rounded and friendly.

## Features

- 📷 **Camera** — take a photo (or pick one) and it's tagged with your location
- 🗺️ **Map** — a whole-world map; every photo becomes a rounded photo-pin
- 🥾 **Hiking trails** — tap the boot button to overlay worldwide hiking trails;
  zoom in anywhere to see the paths
- 🔴 **Record your own trail** — tap “Record a trail” and walk; Tracam traces
  your route live, shows distance and time, and saves it to the map (📜 to
  view/delete your trails)
- 📱 **Installable** — add Tracam to your home screen and it runs full-screen
  like a real app, and opens (with your photos) even offline
- 🏠 **Home** — set any place as your home (defaults to Israel). Search for it or
  use your current location, then tap 🏠 on the map to fly back
- 🐾 **Animals** — Tracam automatically recognises animals in your photos
  (elephants, dogs, birds, and more) and gathers them in an Animals filter
- 🖼️ **Gallery** — your memories grouped by country, with quick filters
- 💡 **Tips** — location-aware ideas (in Thailand it nudges you toward elephants,
  temples and street food) that change as you travel
- ✅ **Challenges** — a fun checklist of shots to hunt for

Photos are stored **on your device** (in the browser), so nothing is uploaded
anywhere. No account, no API keys.

## Tech

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Leaflet](https://leafletjs.com/) + react-leaflet with free OpenStreetMap tiles
- Hiking overlay from [Waymarked Trails](https://hiking.waymarkedtrails.org/)
- On-device animal detection with [TensorFlow.js](https://www.tensorflow.org/js)
  (COCO-SSD), lazy-loaded so it never slows the app down
- Browser Geolocation + OpenStreetMap Nominatim for place names & search
- `localStorage` for saving photos, home, and challenge progress

## Run it

```bash
npm install
npm run dev
```

Then open the printed URL. The **camera and location work best over HTTPS or on
`localhost`** (browsers require a secure context for them). On your phone,
opening it via a tunnel/HTTPS URL will let you use the real camera and GPS.

## Build

```bash
npm run build
npm run preview
```

## Deploy to Cloudflare Pages

Tracam is a static site, so Cloudflare Pages is a great fit.

**Option A — connect the repo (recommended):**

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to
   Git**, and pick this repo.
2. Set the build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Deploy. Every push to the branch will rebuild automatically.

**Option B — deploy from your machine with Wrangler:**

```bash
npm run build
npx wrangler pages deploy dist --project-name tracam
```

Cloudflare serves over HTTPS, so the **camera, GPS, and animal detection all
work on your phone** once it's live. The included `public/_redirects` keeps
everything routing to the app.

## Install it on your phone

Once Tracam is live over HTTPS (e.g. on Cloudflare Pages):

- **iPhone (Safari):** Share → **Add to Home Screen**
- **Android (Chrome):** menu → **Install app** (or the install prompt)

It then launches full-screen with its own icon, and the app shell is cached so
it opens even without a connection. Your photos and trails already live on the
device, so they're there offline too. (Maps, place names and animal detection
still need a connection when you use them.)

## Notes

- If the live camera can't open (e.g. permission denied, or an insecure
  connection), Tracam falls back to letting you choose or snap a photo through
  your device's photo picker.
- Reverse geocoding (turning GPS into "Chiang Mai, Thailand") uses a free public
  service and needs internet; without it your photo is still saved and pinned,
  just without a place name.
