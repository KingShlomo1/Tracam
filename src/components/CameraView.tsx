import { useEffect, useRef, useState } from "react";
import type { Photo } from "../types";
import { compressDataUrl, compressFile } from "../image";
import { getCurrentPosition, reverseGeocode } from "../geo";

interface Props {
  onSaved: (photo: Photo) => void;
}

type Status = "idle" | "live" | "review" | "saving" | "nocamera";

export default function CameraView({ onSaved }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [captured, setCaptured] = useState<string | null>(null);

  // Start the live camera on mount; clean up on unmount.
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStatus("live");
      } catch {
        setStatus("nocamera");
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/jpeg", 0.9));
    setStatus("review");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressFile(file);
    setCaptured(dataUrl);
    setStatus("review");
  }

  async function save() {
    if (!captured) return;
    setStatus("saving");
    const image = await compressDataUrl(captured);
    const coords = await getCurrentPosition();
    let place: string | undefined;
    let country: string | undefined;
    if (coords) {
      const info = await reverseGeocode(coords);
      place = info.place;
      country = info.country;
    }
    const photo: Photo = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      image,
      lat: coords?.lat ?? 0,
      lng: coords?.lng ?? 0,
      place,
      country,
      takenAt: Date.now(),
    };
    onSaved(photo);
    setCaptured(null);
    setStatus(streamRef.current ? "live" : "nocamera");
  }

  function retake() {
    setCaptured(null);
    setStatus(streamRef.current ? "live" : "nocamera");
  }

  return (
    <div className="camera">
      {status === "review" && captured ? (
        <>
          <img className="preview-img" src={captured} alt="Your photo" />
          <div className="review-bar">
            <button className="btn ghost" onClick={retake}>
              Retake
            </button>
            <button className="btn" onClick={save}>
              Save to map
            </button>
          </div>
        </>
      ) : status === "saving" ? (
        <>
          {captured && (
            <img className="preview-img" src={captured} alt="Your photo" />
          )}
          <div className="camera-note">📍 Finding where you are…</div>
        </>
      ) : status === "nocamera" ? (
        <div className="camera" style={{ justifyContent: "center", alignItems: "center", padding: 24 }}>
          <div className="empty">
            <div className="big">📷</div>
            <h2>Let's grab a photo</h2>
            <p>
              We couldn't open the live camera here, but you can still pick or
              snap a photo from your device.
            </p>
            <button className="btn" onClick={() => fileRef.current?.click()}>
              Choose a photo
            </button>
          </div>
        </div>
      ) : (
        <>
          <video ref={videoRef} playsInline muted />
          <div className="camera-note">
            Point at something lovely and tap to snap 📸
          </div>
          <div className="camera-controls">
            <button
              className="round-btn"
              onClick={() => fileRef.current?.click()}
              aria-label="Choose from library"
            >
              🖼️
            </button>
            <button className="shutter" onClick={capture} aria-label="Take photo" />
            <span style={{ width: 54 }} />
          </div>
        </>
      )}

      <input
        ref={fileRef}
        className="hidden-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
      />
    </div>
  );
}
