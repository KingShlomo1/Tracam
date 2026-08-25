import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { Home, Photo, Trail } from "../types";
import { useTrailRecorder } from "../hooks/useTrailRecorder";
import { useWakeLock } from "../hooks/useWakeLock";
import { compressFile } from "../image";
import { reverseGeocode } from "../geo";
import Icon from "./Icon";

interface Props {
  photos: Photo[];
  home: Home;
  trails: Trail[];
  onOpen: (photo: Photo) => void;
  onEditHome: () => void;
  onSaveTrail: (trail: Trail) => void;
  onManageTrails: () => void;
  onAddPhoto: (photo: Photo) => void;
}

const placeIcon = L.divIcon({
  className: "",
  html: `<div class="place-pin"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

/** Lets a map click move the placement pin while adding a photo. */
function ClickToPlace({
  active,
  onPick,
}: {
  active: boolean;
  onPick: (latlng: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      if (active) onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
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

/** Soft-red bubble showing how many photos are grouped together. */
function clusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div class="cluster">${count}</div>`,
    className: "",
    iconSize: L.point(46, 46, true),
  });
}

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

function MapRef({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function elapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}

export default function MapView({
  photos,
  home,
  trails,
  onOpen,
  onEditHome,
  onSaveTrail,
  onManageTrails,
  onAddPhoto,
}: Props) {
  const [showTrails, setShowTrails] = useState(false);
  const [naming, setNaming] = useState(false);
  const [trailName, setTrailName] = useState("");
  const [keepAwake, setKeepAwake] = useState(true);
  const [now, setNow] = useState(Date.now());
  const mapRef = useRef<L.Map | null>(null);
  const addFileRef = useRef<HTMLInputElement>(null);

  // "Add a photo to a spot" flow.
  const [placing, setPlacing] = useState<string | null>(null); // image data URL
  const [placeAt, setPlaceAt] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [savingPlace, setSavingPlace] = useState(false);

  async function onAddFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const image = await compressFile(file);
    const c = mapRef.current?.getCenter();
    setPlaceAt(c ? { lat: c.lat, lng: c.lng } : { lat: home.lat, lng: home.lng });
    setPlacing(image);
  }

  async function savePlaced() {
    if (!placing || !placeAt) return;
    setSavingPlace(true);
    const info = await reverseGeocode(placeAt);
    onAddPhoto({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      image: placing,
      lat: placeAt.lat,
      lng: placeAt.lng,
      place: info.place,
      country: info.country,
      takenAt: Date.now(),
    });
    setPlacing(null);
    setPlaceAt(null);
    setSavingPlace(false);
  }

  function cancelPlaced() {
    setPlacing(null);
    setPlaceAt(null);
  }

  const { recording, start, stop, cancel } = useTrailRecorder(onSaveTrail);

  // Keep the screen on while recording, if the traveller wants it.
  useWakeLock(!!recording && keepAwake);

  // Tick the elapsed-time display while recording.
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [recording]);

  // Keep the map centred on the walker while recording.
  useEffect(() => {
    if (!recording || recording.points.length === 0) return;
    const last = recording.points[recording.points.length - 1];
    mapRef.current?.panTo([last.lat, last.lng]);
  }, [recording]);

  const located = useMemo(
    () => photos.filter((p) => p.lat !== 0 || p.lng !== 0),
    [photos]
  );

  function flyHome() {
    mapRef.current?.flyTo([home.lat, home.lng], 6, { duration: 0.8 });
  }

  function finishNaming() {
    stop(trailName);
    setNaming(false);
    setTrailName("");
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
        {showTrails && (
          <TileLayer
            url="https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png"
            opacity={0.9}
          />
        )}
        <MapRef onReady={(m) => (mapRef.current = m)} />
        <FitBounds photos={photos} home={home} />
        <ClickToPlace active={!!placing} onPick={setPlaceAt} />

        {placing && placeAt && (
          <Marker
            position={[placeAt.lat, placeAt.lng]}
            icon={placeIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                setPlaceAt({ lat: p.lat, lng: p.lng });
              },
            }}
          />
        )}

        <Marker position={[home.lat, home.lng]} icon={homeIcon} />

        {/* Saved trails */}
        {trails.map((t) => (
          <Polyline
            key={t.id}
            positions={t.points.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "#f76c6c", weight: 5, opacity: 0.85 }}
          />
        ))}

        {/* The trail being recorded right now */}
        {recording && recording.points.length > 1 && (
          <Polyline
            positions={recording.points.map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: "#f76c6c",
              weight: 6,
              opacity: 0.95,
              dashArray: "1 10",
              lineCap: "round",
            }}
          />
        )}

        <MarkerClusterGroup
          iconCreateFunction={clusterIcon}
          showCoverageOnHover={false}
          maxClusterRadius={50}
          chunkedLoading
        >
          {located.map((photo) => (
            <Marker
              key={photo.id}
              position={[photo.lat, photo.lng]}
              icon={photoIcon(photo)}
              eventHandlers={{ click: () => onOpen(photo) }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Floating map controls */}
      <div className="map-controls">
        <button className="map-btn" onClick={flyHome} aria-label="Fly home">
          <Icon name="home" size={21} />
        </button>
        <button className="map-btn" onClick={onEditHome} aria-label="Set home">
          <Icon name="pin" size={21} />
        </button>
        <button
          className={"map-btn" + (showTrails ? " on" : "")}
          onClick={() => setShowTrails((v) => !v)}
          aria-label="Toggle trails"
        >
          <Icon name="boot" size={21} />
        </button>
        <button
          className="map-btn"
          onClick={onManageTrails}
          aria-label="My trails"
        >
          <Icon name="route" size={21} />
        </button>
        <button
          className="map-btn accent"
          onClick={() => addFileRef.current?.click()}
          aria-label="Add a photo to the map"
        >
          <Icon name="plus" size={22} />
        </button>
      </div>

      <input
        ref={addFileRef}
        className="hidden-input"
        type="file"
        accept="image/*"
        onChange={onAddFile}
      />

      {/* Placing a photo on the map */}
      {placing && (
        <div className="record-panel">
          <div className="place-head">
            <img className="place-thumb" src={placing} alt="" />
            <div>
              <div className="place-title-sm">Drop it on the map</div>
              <div className="muted">Tap the map or drag the pin to the spot</div>
            </div>
          </div>
          <div className="record-actions">
            <button className="btn ghost" onClick={cancelPlaced}>
              Cancel
            </button>
            <button className="btn" onClick={savePlaced} disabled={savingPlace}>
              {savingPlace ? "Saving…" : "Save here"}
            </button>
          </div>
        </div>
      )}

      {/* Trail recorder */}
      {placing ? null : !recording ? (
        <button className="record-pill" onClick={start}>
          <span className="rec-dot" /> Record a trail
        </button>
      ) : naming ? (
        <div className="record-panel">
          <input
            className="caption-input"
            style={{ marginTop: 0 }}
            placeholder="Name this trail…"
            value={trailName}
            autoFocus
            onChange={(e) => setTrailName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && finishNaming()}
          />
          <div className="record-actions">
            <button className="btn ghost" onClick={() => setNaming(false)}>
              Back
            </button>
            <button className="btn" onClick={finishNaming}>
              Save trail
            </button>
          </div>
        </div>
      ) : (
        <div className="record-panel">
          <div className="record-stats">
            <span className="rec-dot live" />
            <b>{recording.distanceKm.toFixed(2)} km</b>
            <span className="muted">{elapsed(now - recording.startedAt)}</span>
            <span className="muted">{recording.points.length} pts</span>
          </div>
          <button
            className="awake-toggle"
            onClick={() => setKeepAwake((v) => !v)}
          >
            <span className={"switch" + (keepAwake ? " on" : "")} />
            Keep screen on while recording
          </button>
          <div className="record-actions">
            <button className="btn danger" onClick={cancel}>
              Discard
            </button>
            <button
              className="btn"
              onClick={() => setNaming(true)}
              disabled={recording.points.length < 2}
            >
              Finish
            </button>
          </div>
        </div>
      )}

      {located.length === 0 && !recording && (
        <div className="camera-note" style={{ top: 76, bottom: "auto" }}>
          No pins yet — snap a photo and it'll appear here 📍
        </div>
      )}
    </div>
  );
}
