import type { Trail } from "../types";
import { shareTrailGpx } from "../gpx";

interface Props {
  trails: Trail[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

function duration(t: Trail): string {
  const mins = Math.max(1, Math.round((t.endedAt - t.startedAt) / 60000));
  return mins < 60 ? `${mins} min` : `${(mins / 60).toFixed(1)} h`;
}

export default function TrailsModal({ trails, onClose, onDelete }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="meta">
          <div className="place">🥾 My trails</div>
          <div className="when">
            {trails.length
              ? `${trails.length} recorded`
              : "Nothing recorded yet"}
          </div>
        </div>

        {trails.length === 0 ? (
          <p style={{ color: "var(--muted)", padding: "8px 4px 4px", fontSize: 14 }}>
            Tap “Record a trail” on the map and take a walk — your route will be
            drawn on the map and saved here.
          </p>
        ) : (
          <div className="results" style={{ marginTop: 12 }}>
            {trails.map((t) => (
              <div key={t.id} className="trail-row">
                <div className="trail-info">
                  <div className="trail-name">🥾 {t.name}</div>
                  <div className="when">
                    {t.distanceKm.toFixed(2)} km · {duration(t)} ·{" "}
                    {new Date(t.startedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="check-del share"
                  onClick={() => shareTrailGpx(t)}
                  aria-label="Export trail as GPX"
                  title="Export / share as GPX"
                >
                  📤
                </button>
                <button
                  className="check-del"
                  onClick={() => {
                    if (confirm(`Delete "${t.name}"?`)) onDelete(t.id);
                  }}
                  aria-label="Delete trail"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
