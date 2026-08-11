import { useState } from "react";
import type { Photo, TabId } from "./types";
import { usePhotos } from "./hooks/usePhotos";
import TabBar from "./components/TabBar";
import MapView from "./components/MapView";
import CameraView from "./components/CameraView";
import GalleryView from "./components/GalleryView";
import TipsView from "./components/TipsView";
import PhotoModal from "./components/PhotoModal";

export default function App() {
  const { photos, addPhoto, updatePhoto, removePhoto } = usePhotos();
  const [tab, setTab] = useState<TabId>("map");
  const [selected, setSelected] = useState<Photo | null>(null);

  function handleSaved(photo: Photo) {
    addPhoto(photo);
    setTab("map");
  }

  return (
    <div className="app">
      {tab === "map" && <MapView photos={photos} onOpen={setSelected} />}

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
    </div>
  );
}
