import { useEffect, useMemo, useState } from "react";
import type { Photo } from "../types";
import { tipsForCountry } from "../data/tips";
import { CHALLENGES } from "../data/challenges";
import { loadDoneChallenges, saveDoneChallenges } from "../storage";
import { getCurrentPosition, reverseGeocode } from "../geo";

interface Props {
  photos: Photo[];
}

export default function TipsView({ photos }: Props) {
  const [liveCountry, setLiveCountry] = useState<string | undefined>();
  const [done, setDone] = useState<string[]>(() => loadDoneChallenges());

  // Prefer the live location; fall back to the most recent located photo.
  const fallbackCountry = useMemo(
    () => photos.find((p) => p.country)?.country,
    [photos]
  );

  useEffect(() => {
    let active = true;
    getCurrentPosition().then((coords) => {
      if (!coords || !active) return;
      reverseGeocode(coords).then((info) => {
        if (active && info.country) setLiveCountry(info.country);
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const place = tipsForCountry(liveCountry ?? fallbackCountry);

  function toggle(id: string) {
    setDone((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      saveDoneChallenges(next);
      return next;
    });
  }

  const doneCount = CHALLENGES.filter((c) => done.includes(c.id)).length;

  return (
    <div className="screen">
      <header className="header">
        <h1>Tips</h1>
        <p>What to point your camera at</p>
      </header>

      <div className="section">
        <div className="tips-card">
          <div className="place-title">
            <span className="em">{place.emoji}</span>
            {place.country}
          </div>
          {place.tips.map((tip, i) => (
            <div className="tip" key={i}>
              <span className="dot">●</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <h2>Photo challenges</h2>
        <p className="progress">
          {doneCount} of {CHALLENGES.length} done
        </p>
        {CHALLENGES.map((c) => {
          const isDone = done.includes(c.id);
          return (
            <button
              key={c.id}
              className={"challenge" + (isDone ? " done" : "")}
              onClick={() => toggle(c.id)}
            >
              <span className="em">{c.emoji}</span>
              <span className="txt">{c.text}</span>
              <span className="check">{isDone ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
