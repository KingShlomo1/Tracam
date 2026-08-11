import { useMemo, useState } from "react";
import type { Photo } from "../types";

interface Props {
  photos: Photo[];
  onOpen: (photo: Photo) => void;
  onGoToCamera: () => void;
}

type Filter = "all" | "animals" | string; // string = "country:<name>"

export default function GalleryView({ photos, onOpen, onGoToCamera }: Props) {
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
        <p>
          {photos.length} memor{photos.length === 1 ? "y" : "ies"}
          {countries.length > 0 && ` · ${countries.length} countr${countries.length === 1 ? "y" : "ies"}`}
        </p>
      </header>

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
