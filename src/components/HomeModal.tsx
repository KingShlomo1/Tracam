import { useState } from "react";
import type { Home } from "../types";
import { searchPlaces, getCurrentPosition, reverseGeocode } from "../geo";
import type { PlaceResult } from "../geo";

interface Props {
  home: Home;
  onClose: () => void;
  onSave: (home: Home) => void;
}

export default function HomeModal({ home, onClose, onSave }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [busy, setBusy] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setBusy(true);
    setResults(await searchPlaces(query));
    setBusy(false);
  }

  async function useCurrent() {
    setBusy(true);
    const coords = await getCurrentPosition();
    if (coords) {
      const info = await reverseGeocode(coords);
      onSave({
        lat: coords.lat,
        lng: coords.lng,
        name: info.place || "My location",
      });
      onClose();
    } else {
      alert("Couldn't get your location. Try searching for a place instead.");
    }
    setBusy(false);
  }

  function pick(r: PlaceResult) {
    // Keep the home name short and friendly (first part of the address).
    const shortName = r.name.split(",")[0];
    onSave({ lat: r.lat, lng: r.lng, name: shortName });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="meta">
          <div className="place">🏠 Set your home</div>
          <div className="when">Currently: {home.name}</div>
        </div>

        <div className="search-row">
          <input
            className="caption-input"
            style={{ marginTop: 0 }}
            placeholder="Search a place, e.g. Israel"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button className="btn" onClick={search} disabled={busy}>
            {busy ? "…" : "Search"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="results">
            {results.map((r, i) => (
              <button key={i} className="result" onClick={() => pick(r)}>
                <span className="dot">📍</span>
                <span>{r.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn ghost" onClick={useCurrent} disabled={busy}>
            Use my current location
          </button>
        </div>
      </div>
    </div>
  );
}
