import { useEffect, useRef, useState } from "react";
import type { Home, Photo, TabId, Trail } from "./types";
import { usePhotos } from "./hooks/usePhotos";
import { loadHome, saveHome, loadTrails, saveTrails } from "./storage";
import { detectAnimals } from "./animals";
import TabBar from "./components/TabBar";
import MapView from "./components/MapView";
import CameraView from "./components/CameraView";
import GalleryView from "./components/GalleryView";
import TipsView from "./components/TipsView";
import PhotoModal from "./components/PhotoModal";
import HomeModal from "./components/HomeModal";
import TrailsModal from "./components/TrailsModal";

export default function App() {
  const { photos, addPhoto, updatePhoto, removePhoto } = usePhotos();
  const [tab, setTab] = useState<TabId>("map");
  const [selected, setSelected] = useState<Photo | null>(null);
  const [home, setHome] = useState<Home>(() => loadHome());
  const [homeOpen, setHomeOpen] = useState(false);
  const [trails, setTrails] = useState<Trail[]>(() => loadTrails());
  const [trailsOpen, setTrailsOpen] = useState(false);

  function addTrail(trail: Trail) {
    setTrails((prev) => {
      const next = [trail, ...prev];
      saveTrails(next);
      return next;
    });
  }

  function removeTrail(id: string) {
    setTrails((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTrails(next);
      return next;
    });
  }

  // Background animal detection: scan any not-yet-scanned photo, one at a time.
  const scanning = useRef(false);
  const scanFailed = useRef(false);
  useEffect(() => {
    if (scanning.current || scanFailed.current) return;
    const next = photos.find((p) => !p.scanned && p.image);
    if (!next) return;
    scanning.current = true;
    (async () => {
      try {
        const animals = await detectAnimals(next.image);
        updatePhoto(next.id, { animals, scanned: true });
      } catch {
        // Model unreachable (likely offline) — stop trying this session.
        scanFailed.current = true;
      } finally {
        scanning.current = false;
      }
    })();
  }, [photos, updatePhoto]);

  function handleSaved(photo: Photo) {
    addPhoto(photo);
    setTab("map");
  }

  function handleSaveHome(h: Home) {
    setHome(h);
    saveHome(h);
  }

  return (
    <div className="app">
      {tab === "map" && (
        <MapView
          photos={photos}
          home={home}
          trails={trails}
          onOpen={setSelected}
          onEditHome={() => setHomeOpen(true)}
          onSaveTrail={addTrail}
          onManageTrails={() => setTrailsOpen(true)}
        />
      )}

      {tab === "camera" && <CameraView onSaved={handleSaved} />}

      {tab === "gallery" && (
        <GalleryView
          photos={photos}
          onOpen={setSelected}
          onGoToCamera={() => setTab("camera")}
        />
      )}

      {tab === "tips" && <TipsView photos={photos} />}

      <TabBar active={tab} onChange={setTab} />

      {selected && (
        <PhotoModal
          photo={selected}
          onClose={() => setSelected(null)}
          onSaveCaption={(id, caption) => updatePhoto(id, { caption })}
          onDelete={removePhoto}
        />
      )}

      {homeOpen && (
        <HomeModal
          home={home}
          onClose={() => setHomeOpen(false)}
          onSave={handleSaveHome}
        />
      )}

      {trailsOpen && (
        <TrailsModal
          trails={trails}
          onClose={() => setTrailsOpen(false)}
          onDelete={removeTrail}
        />
      )}
    </div>
  );
}
