import { useCallback, useRef, useState } from "react";
import type { Trail, TrailPoint } from "../types";
import { distanceKm } from "../geo";

export interface Recording {
  points: TrailPoint[];
  distanceKm: number;
  startedAt: number;
}

/**
 * Records a walking trail using the browser's geolocation watch. Collects
 * points as you move, keeps a running distance, and hands back a finished
 * Trail when you stop.
 */
export function useTrailRecorder(onSave: (trail: Trail) => void) {
  const [recording, setRecording] = useState<Recording | null>(null);
  const watchId = useRef<number | null>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const distRef = useRef(0);

  const start = useCallback(() => {
    if (!("geolocation" in navigator)) {
      alert("Location isn't available on this device, so trails can't record.");
      return;
    }
    pointsRef.current = [];
    distRef.current = 0;
    const startedAt = Date.now();
    setRecording({ points: [], distanceKm: 0, startedAt });

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt: TrailPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          t: Date.now(),
        };
        const prev = pointsRef.current[pointsRef.current.length - 1];
        // Ignore tiny jitters (< 5 m) so the line stays clean.
        if (prev && distanceKm(prev, pt) * 1000 < 5) return;
        if (prev) distRef.current += distanceKm(prev, pt);
        pointsRef.current = [...pointsRef.current, pt];
        setRecording({
          points: pointsRef.current,
          distanceKm: distRef.current,
          startedAt,
        });
      },
      () => {
        alert("Couldn't read your location. Check location permission.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, []);

  const stop = useCallback(
    (name: string) => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      const pts = pointsRef.current;
      if (pts.length >= 2) {
        onSave({
          id: `trail-${Date.now()}`,
          name: name.trim() || "My trail",
          points: pts,
          startedAt: pts[0].t,
          endedAt: pts[pts.length - 1].t,
          distanceKm: distRef.current,
        });
      }
      setRecording(null);
    },
    [onSave]
  );

  const cancel = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setRecording(null);
  }, []);

  return { recording, start, stop, cancel };
}
