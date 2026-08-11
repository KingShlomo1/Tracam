import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { Photo } from "../types";

interface Props {
  photos: Photo[];
  onOpen: (photo: Photo) => void;
}

function photoIcon(photo: Photo) {
  return L.divIcon({
    className: "",
    html: `<div class="pin"><img src="${photo.image}" alt="" /></div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 44],
  });
}

/** Fit the map to all pins whenever they change. */
function FitBounds({ photos }: { photos: Photo[] }) {
  const map = useMap();
  useEffect(() => {
    const located = photos.filter((p) => p.lat !== 0 || p.lng !== 0);
    if (located.length === 0) return;
    if (located.length === 1) {
      map.setView([located[0].lat, located[0].lng], 9);
      return;
    }
    const bounds = L.latLngBounds(
      located.map((p) => [p.lat, p.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
  }, [photos, map]);
  return null;
}

export default function MapView({ photos, onOpen }: Props) {
  const located = useMemo(
    () => photos.filter((p) => p.lat !== 0 || p.lng !== 0),
    [photos]
  );

  return (
    <div className="map-wrap">
      <MapContainer
        center={[13.7563, 100.5018] /* Bangkok, a nice default */}
        zoom={3}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <FitBounds photos={photos} />
        {located.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.lat, photo.lng]}
            icon={photoIcon(photo)}
            eventHandlers={{ click: () => onOpen(photo) }}
          />
        ))}
      </MapContainer>

      {located.length === 0 && (
        <div className="camera-note" style={{ top: "auto", bottom: 120 }}>
          No pins yet — snap a photo and it'll appear here 📍
        </div>
      )}
    </div>
  );
}
