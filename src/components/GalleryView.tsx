import type { Photo } from "../types";

interface Props {
  photos: Photo[];
  onOpen: (photo: Photo) => void;
  onGoToCamera: () => void;
}

export default function GalleryView({ photos, onOpen, onGoToCamera }: Props) {
  return (
    <div className="screen">
      <header className="header">
        <h1>Gallery</h1>
        <p>
          {photos.length > 0
            ? `${photos.length} memor${photos.length === 1 ? "y" : "ies"} so far`
            : "Your travel memories live here"}
        </p>
      </header>

      {photos.length === 0 ? (
        <div className="empty">
          <div className="big">🖼️</div>
          <h2>No photos yet</h2>
          <p>Take your first travel photo and it'll show up here and on the map.</p>
          <button className="btn" onClick={onGoToCamera}>
            Open camera
          </button>
        </div>
      ) : (
        <div className="grid">
          {photos.map((photo) => (
            <button
              key={photo.id}
              className="thumb"
              onClick={() => onOpen(photo)}
            >
              <img src={photo.image} alt={photo.caption || "Travel photo"} />
              {photo.place && <span className="place">{photo.place}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
