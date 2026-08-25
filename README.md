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
- 🤖 **AI place finder** — describe where you were ("the Erawan waterfall in
  Kanchanaburi, Thailand") and Tracam pins it on the map and attaches your photo
- 🔵 **Live location** — a "you are here" dot that follows you, plus a locate button
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

## Deploy to Cloudflare

Tracam is a static single-page app. The repo includes a `wrangler.jsonc` that
serves the built `dist/` folder as static assets, so deploying is one command.

### Cloudflare Workers (this is what `*.workers.dev` uses)

From your machine:

```bash
npx wrangler login      # once, opens the browser to authorise
npm run deploy          # builds, then `wrangler deploy`
```

That publishes the `tracam` Worker to `https://tracam.<your>.workers.dev`.

> If you see Cloudflare's **“There is nothing here yet”** page, it means a
> Worker exists but no app was uploaded to it yet — running `npm run deploy`
> above (with `wrangler.jsonc` present) fixes that by uploading the built site.

If instead you connected the repo in the dashboard (**Workers Builds**), set:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`

and it will pick up `wrangler.jsonc` automatically on the next push.

### Enable the AI place finder

The app is a small full-stack Worker: `worker/index.ts` serves the site and a
`POST /api/locate` endpoint. That endpoint uses Claude (the fast, inexpensive
`claude-haiku-4-5` model) to turn your description into a place query, then
geocodes it — so your API key stays server-side, never in the browser.

To turn it on, add your Anthropic API key as a **secret** (not a plain variable):

1. Cloudflare dashboard → your **tracam** Worker → **Settings** →
   **Variables and Secrets**.
2. Add a **Secret** named exactly `ANTHROPIC_API_KEY` with your key as the value.
3. Redeploy (any push, or **Deployments → Retry**).

Get a key at <https://console.anthropic.com>. Until it's set, the AI button
politely says it isn't configured yet; everything else works without it.

### Or Cloudflare Pages

Prefer Pages? **Workers & Pages → Create → Pages → Connect to Git**, then:

- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`

Either way, Cloudflare serves over HTTPS, so the **camera, GPS, trail
recording, and animal detection all work on your phone** once it's live.

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
