import { useMemo, useState } from "react";
import type { Photo, Trail } from "../types";
import Icon from "./Icon";

interface Props {
  photos: Photo[];
  trails: Trail[];
  onOpen: (photo: Photo) => void;
  onGoToCamera: () => void;
  onDeleteMany: (ids: string[]) => void;
}

type Filter = "all" | "animals" | "favorites" | string; // "country:<name>"
type Sort = "new" | "old";

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

function monthLabel(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function GalleryView({
  photos,
  trails,
  onOpen,
  onGoToCamera,
  onDeleteMany,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const countries = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => p.country && set.add(p.country));
    return Array.from(set).sort();
  }, [photos]);

  const animalCount = useMemo(
    () => photos.filter((p) => p.animals && p.animals.length > 0).length,
    [photos]
  );
  const favCount = useMemo(
    () => photos.filter((p) => p.favorite).length,
    [photos]
  );

  // Apply filter + search + sort.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = photos.filter((p) => {
      if (filter === "animals") return p.animals && p.animals.length > 0;
      if (filter === "favorites") return p.favorite;
      if (filter.startsWith("country:"))
        return p.country === filter.slice(8);
      return true;
    });
    if (q) {
      list = list.filter((p) =>
        [p.caption, p.place, p.country, ...(p.animals || [])]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(q))
      );
    }
    list = [...list].sort((a, b) =>
      sort === "new" ? b.takenAt - a.takenAt : a.takenAt - b.takenAt
    );
    return list;
  }, [photos, filter, query, sort]);

  // Group visible photos into dated sections (timeline).
  const groups = useMemo(() => {
    const map = new Map<string, Photo[]>();
    for (const p of visible) {
      const key = monthLabel(p.takenAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [visible]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleThumb(p: Photo) {
    if (selectMode) toggleSelect(p.id);
    else onOpen(p);
  }

  function deleteSelected() {
    if (selected.size === 0) return;
    if (confirm(`Delete ${selected.size} photo${selected.size === 1 ? "" : "s"}?`)) {
      onDeleteMany([...selected]);
      setSelected(new Set());
      setSelectMode(false);
    }
  }

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
        {list.map((photo) => {
          const isSel = selected.has(photo.id);
          return (
            <button
              key={photo.id}
              className={"thumb" + (isSel ? " selected" : "")}
              onClick={() => handleThumb(photo)}
            >
              <img src={photo.image} alt={photo.caption || "Travel photo"} />
              {photo.favorite && (
                <span className="thumb-heart">
                  <Icon name="heart" size={15} fill />
                </span>
              )}
              {photo.animals && photo.animals.length > 0 && (
                <span className="thumb-badge">🐾</span>
              )}
              {selectMode && (
                <span className={"sel-ring" + (isSel ? " on" : "")}>
                  {isSel && <Icon name="check" size={15} />}
                </span>
              )}
              {photo.place && !selectMode && (
                <span className="place">{photo.place}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "favorites", label: `♥ Favorites${favCount ? ` ${favCount}` : ""}` },
    { key: "animals", label: `🐾 Animals${animalCount ? ` ${animalCount}` : ""}` },
    ...countries.map((c) => ({ key: `country:${c}` as Filter, label: c })),
  ];

  return (
    <div className="screen">
      <header className="header">
        <h1>Gallery</h1>
        <p>Your travel journey so far</p>
      </header>

      <StatTiles photos={photos} trails={trails} />

      {/* Search + tools */}
      <div className="search-bar">
        <span className="search-ico">
          <Icon name="search" size={18} />
        </span>
        <input
          className="search-input"
          placeholder="Search places, captions, animals…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="tool-btn"
          onClick={() => setSort((s) => (s === "new" ? "old" : "new"))}
          aria-label="Sort"
          title={sort === "new" ? "Newest first" : "Oldest first"}
        >
          <Icon name="sort" size={18} />
        </button>
        <button
          className={"tool-btn" + (selectMode ? " on" : "")}
          onClick={() => {
            setSelectMode((v) => !v);
            setSelected(new Set());
          }}
          aria-label="Select"
        >
          <Icon name="check" size={18} />
        </button>
      </div>

      {/* Filter chips */}
      <div className="chips">
        {chips.map((c) => (
          <button
            key={c.key}
            className={"chip" + (filter === c.key ? " on" : "")}
            onClick={() => setFilter(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <div className="big">🔍</div>
          <h2>Nothing here</h2>
          <p>Try another search or filter.</p>
        </div>
      ) : (
        groups.map(([label, list]) => (
          <div key={label}>
            <h2 className="group-title">{label}</h2>
            {grid(list)}
          </div>
        ))
      )}

      {/* Selection action bar */}
      {selectMode && (
        <div className="select-bar">
          <span>{selected.size} selected</span>
          <button
            className="btn danger"
            onClick={deleteSelected}
            disabled={selected.size === 0}
          >
            <Icon name="trash" size={17} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
