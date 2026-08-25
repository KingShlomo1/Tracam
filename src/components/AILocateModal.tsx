import { useRef, useState } from "react";
import type { Photo } from "../types";
import { compressFile } from "../image";
import Icon from "./Icon";

interface Props {
  onClose: () => void;
  onAdd: (photo: Photo) => void;
}

interface Candidate {
  lat: number;
  lng: number;
  label: string;
}

type Step = "input" | "loading" | "results";

export default function AILocateModal({ onClose, onAdd }: Props) {
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Candidate[]>([]);
  const [placeLabel, setPlaceLabel] = useState("");
  const [country, setCountry] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImage(await compressFile(file));
  }

  async function find() {
    if (!desc.trim()) return;
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/locate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: desc.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.message || friendlyError(data.error));
        setStep("input");
        return;
      }
      if (!data.results || data.results.length === 0) {
        setError("Couldn't find that place — try adding the country or a nearby town.");
        setStep("input");
        return;
      }
      setResults(data.results);
      setPlaceLabel(data.placeLabel || "");
      setCountry(data.country || "");
      setStep("results");
    } catch {
      setError(
        "The AI locator needs the deployed app (it can't run in local preview)."
      );
      setStep("input");
    }
  }

  function addAt(c: Candidate) {
    onAdd({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      image: image || placeholderImage(placeLabel || country),
      lat: c.lat,
      lng: c.lng,
      place: shorten(c.label),
      country: country || undefined,
      takenAt: Date.now(),
    });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-head">
          <span className="ai-spark">
            <Icon name="sparkles" size={22} />
          </span>
          <div>
            <div className="place">AI place finder</div>
            <div className="when">Describe where you were — I'll pin it</div>
          </div>
        </div>

        {step !== "results" && (
          <>
            <textarea
              className="caption-input"
              rows={3}
              placeholder="e.g. The Erawan waterfall in Kanchanaburi, Thailand"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <button
              className="photo-attach"
              onClick={() => fileRef.current?.click()}
            >
              {image ? (
                <img src={image} alt="" />
              ) : (
                <span className="attach-plus">
                  <Icon name="image" size={20} /> Attach the photo (optional)
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              className="hidden-input"
              type="file"
              accept="image/*"
              onChange={pickPhoto}
            />

            {error && <div className="ai-error">{error}</div>}

            <div className="modal-actions">
              <button className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn grow"
                onClick={find}
                disabled={step === "loading" || !desc.trim()}
              >
                {step === "loading" ? "Finding…" : "Find on map"}
              </button>
            </div>
          </>
        )}

        {step === "results" && (
          <>
            <p className="ai-found">
              {placeLabel ? `Found “${placeLabel}”` : "Here's what I found"} — pick
              the right spot:
            </p>
            <div className="results">
              {results.map((c, i) => (
                <button key={i} className="result" onClick={() => addAt(c)}>
                  <span className="dot">
                    <Icon name="pin" size={18} />
                  </span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setStep("input")}>
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function friendlyError(code: string): string {
  if (code === "no_key")
    return "Add your ANTHROPIC_API_KEY in Cloudflare to enable the AI locator.";
  return "Something went wrong finding that place. Try again.";
}

function shorten(label: string): string {
  const parts = label.split(",").map((s) => s.trim());
  if (parts.length <= 2) return label;
  return [parts[0], parts[parts.length - 1]].join(", ");
}

function placeholderImage(label: string): string {
  const text = (label || "📍").slice(0, 18);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#ff9a86'/><stop offset='1' stop-color='#f76c6c'/></linearGradient></defs><rect width='300' height='300' fill='url(#g)'/><text x='150' y='150' font-size='90' text-anchor='middle'>📍</text><text x='150' y='230' font-size='22' fill='white' text-anchor='middle' font-family='sans-serif'>${text}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
