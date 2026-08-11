# 🍓 Tracam

A soft, simple little travel camera. Snap photos on your trip and Tracam pins
each one to a map where you took it — plus gentle tips on what to photograph and
a playful photo-challenge checklist.

Everything is white and light soft red, and rounded and friendly.

## Features

- 📷 **Camera** — take a photo (or pick one) and it's tagged with your location
- 🗺️ **Map** — every photo becomes a rounded pin on an OpenStreetMap map
- 🖼️ **Gallery** — a clean grid of all your memories
- 💡 **Tips** — location-aware ideas (in Thailand it nudges you toward elephants,
  temples and street food) that change as you travel
- ✅ **Challenges** — a fun checklist of shots to hunt for

Photos are stored **on your device** (in the browser), so nothing is uploaded
anywhere. No account, no API keys.

## Tech

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Leaflet](https://leafletjs.com/) + react-leaflet with free OpenStreetMap tiles
- Browser Geolocation + OpenStreetMap Nominatim for place names
- `localStorage` for saving photos and challenge progress

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

## Notes

- If the live camera can't open (e.g. permission denied, or an insecure
  connection), Tracam falls back to letting you choose or snap a photo through
  your device's photo picker.
- Reverse geocoding (turning GPS into "Chiang Mai, Thailand") uses a free public
  service and needs internet; without it your photo is still saved and pinned,
  just without a place name.
