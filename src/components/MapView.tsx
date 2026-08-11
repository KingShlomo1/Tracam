import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { Home, Photo } from "../types";

interface Props {
  photos: Photo[];
  home: Home;
  onOpen: (photo: Photo) => void;
  onEditHome: () => void;
}

function photoIcon(photo: Photo) {
  const badge = photo.animals && photo.animals.length > 0 ? "🐾" : "";
  return L.divIcon({
    className: "",
    html: `<div class="pin"><img src="${photo.image}" alt="" />${
      badge ? `<span class="pin-badge">${badge}</span>` : ""
    }</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 44],
  });
}

const homeIcon = L.divIcon({
  className: "",
  html: `<div class="home-pin">🏠</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 38],
});

/** Fit the map to all pins the first time they load. */
function FitBounds({ photos, home }: { photos: Photo[]; home: Home }) {
  const map = useMap();
  const didFit = useRef(false);
  useEffect(() => {
    if (didFit.current) return;
    const located = photos.filter((p) => p.lat !== 0 || p.lng !== 0);
    if (located.length === 0) {
      map.setView([home.lat, home.lng], 5);
      didFit.current = true;
      return;
    }
    didFit.current = true;
    if (located.length === 1) {
      map.setView([located[0].lat, located[0].lng], 9);
      return;
    }
    const bounds = L.latLngBounds(
      located.map((p) => [p.lat, p.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
  }, [photos, home, map]);
  return null;
}

/** Exposes the leaflet map instance to the parent for the control buttons. */
function MapRef({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => onReady(map), [map, onReady]);
  return null;
}

export default function MapView({ photos, home, onOpen, onEditHome }: Props) {
  const [showTrails, setShowTrails] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const located = useMemo(
    () => photos.filter((p) => p.lat !== 0 || p.lng !== 0),
    [photos]
  );

  function flyHome() {
    mapRef.current?.flyTo([home.lat, home.lng], 6, { duration: 0.8 });
  }

  return (
    <div className="map-wrap">
      <MapContainer
        center={[home.lat, home.lng]}
        zoom={2}
        minZoom={2}
        maxZoom={17}
        worldCopyJump
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        {/* Worldwide hiking trails — appear as you zoom in. */}
        {showTrails && (
          <TileLayer
            url="https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png"
            opacity={0.9}
          />
        )}
        <MapRef onReady={(m) => (mapRef.current = m)} />
        <FitBounds photos={photos} home={home} />

        <Marker position={[home.lat, home.lng]} icon={homeIcon} />

        {located.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.lat, photo.lng]}
            icon={photoIcon(photo)}
            eventHandlers={{ click: () => onOpen(photo) }}
          />
        ))}
      </MapContainer>

      {/* Floating map controls */}
      <div className="map-controls">
        <button
          className="map-btn"
          onClick={flyHome}
          title={`Fly to ${home.name}`}
          aria-label="Fly home"
        >
          🏠
        </button>
        <button
          className="map-btn"
          onClick={onEditHome}
          title="Set your home"
          aria-label="Set home"
        >
          📍
        </button>
        <button
          className={"map-btn" + (showTrails ? " on" : "")}
          onClick={() => setShowTrails((v) => !v)}
          title="Toggle hiking trails"
          aria-label="Toggle trails"
        >
          🥾
        </button>
      </div>

      {located.length === 0 && (
        <div className="camera-note" style={{ top: "auto", bottom: 120 }}>
          No pins yet — snap a photo and it'll appear here 📍
        </div>
      )}
    </div>
  );
}
