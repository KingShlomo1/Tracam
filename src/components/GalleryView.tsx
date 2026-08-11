import { useMemo, useState } from "react";
import type { Photo, Trail } from "../types";

interface Props {
  photos: Photo[];
  trails: Trail[];
  onOpen: (photo: Photo) => void;
  onGoToCamera: () => void;
}

function StatTiles({ photos, trails }: { photos: Photo[]; trails: Trail[] }) {
  const countries = new Set(photos.map((p) => p.country).filter(Boolean)).size;
  const animals = photos.filter((p) => p.animals && p.animals.length > 0).length;
  const km = trails.reduce((sum, t) => sum + t.distanceKm, 0);
  const tiles = [
    { emoji: "🌍", value: countries, label: countries === 1 ? "country" : "countries" },
    { emoji: "📸", value: photos.length, label: photos.length === 1 ? "photo" : "photos" },
    { emoji: "🐾", value: animals, label: "animals" },
    { emoji: "🥾", value: `${km.toFixed(1)}`, label: "km walked" },
  ];
  return (
    <div className="stats">
      {tiles.map((t) => (
        <div className="stat" key={t.label}>
          <span className="stat-em">{t.emoji}</span>
          <span className="stat-value">{t.value}</span>
          <span className="stat-label">{t.label}</span>
        </div>
      ))}
    </div>
  );
}

type Filter = "all" | "animals" | string; // string = "country:<name>"

export default function GalleryView({
  photos,
  trails,
  onOpen,
  onGoToCamera,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const countries = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => p.country && set.add(p.country));
    return Array.from(set).sort();
  }, [photos]);

  const animalCount = useMemo(
    () => photos.filter((p) => p.animals && p.animals.length > 0).length,
    [photos]
  );

  // Group photos by country for the "all" view.
  const grouped = useMemo(() => {
    const map = new Map<string, Photo[]>();
    for (const p of photos) {
      const key = p.country || "🌍 Somewhere else";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [photos]);

  if (photos.length === 0) {
    return (
      <div className="screen">
        <header className="header">
          <h1>Gallery</h1>
          <p>Your travel memories live here</p>
        </header>
        <div className="empty">
          <div className="big">🖼️</div>
          <h2>No photos yet</h2>
          <p>Take your first travel photo and it'll show up here and on the map.</p>
          <button className="btn" onClick={onGoToCamera}>
            Open camera
          </button>
        </div>
      </div>
    );
  }

  function grid(list: Photo[]) {
    return (
      <div className="grid">
        {list.map((photo) => (
          <button key={photo.id} className="thumb" onClick={() => onOpen(photo)}>
            <img src={photo.image} alt={photo.caption || "Travel photo"} />
            {photo.animals && photo.animals.length > 0 && (
              <span className="thumb-badge">🐾</span>
            )}
            {photo.place && <span className="place">{photo.place}</span>}
          </button>
        ))}
      </div>
    );
  }

  const animalPhotos = photos.filter((p) => p.animals && p.animals.length > 0);

  return (
    <div className="screen">
      <header className="header">
        <h1>Gallery</h1>
        <p>Your travel journey so far</p>
      </header>

      <StatTiles photos={photos} trails={trails} />

      {/* Filter chips */}
      <div className="chips">
        <button
          className={"chip" + (filter === "all" ? " on" : "")}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={"chip" + (filter === "animals" ? " on" : "")}
          onClick={() => setFilter("animals")}
        >
          🐾 Animals{animalCount ? ` ${animalCount}` : ""}
        </button>
        {countries.map((c) => (
          <button
            key={c}
            className={"chip" + (filter === `country:${c}` ? " on" : "")}
            onClick={() => setFilter(`country:${c}`)}
          >
            {c}
          </button>
        ))}
      </div>

      {filter === "all" &&
        grouped.map(([country, list]) => (
          <div key={country}>
            <h2 className="group-title">{country}</h2>
            {grid(list)}
          </div>
        ))}

      {filter === "animals" &&
        (animalPhotos.length > 0 ? (
          grid(animalPhotos)
        ) : (
          <div className="empty">
            <div className="big">🐾</div>
            <h2>No animals spotted yet</h2>
            <p>
              Snap a photo of an animal — an elephant, a dog, a bird — and Tracam
              will recognise it and collect it here automatically.
            </p>
          </div>
        ))}

      {filter.startsWith("country:") &&
        grid(photos.filter((p) => p.country === filter.slice("country:".length)))}
    </div>
  );
}
