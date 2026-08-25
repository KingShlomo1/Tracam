import { useState } from "react";
import type { Photo } from "../types";
import { sharePhoto } from "../share";
import Icon from "./Icon";

interface Props {
  photo: Photo;
  onClose: () => void;
  onSaveCaption: (id: string, caption: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PhotoModal({
  photo,
  onClose,
  onSaveCaption,
  onToggleFavorite,
  onDelete,
}: Props) {
  const [caption, setCaption] = useState(photo.caption ?? "");
  const fav = !!photo.favorite;

  const when = new Date(photo.takenAt).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function saveAndClose() {
    onSaveCaption(photo.id, caption.trim());
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="photo-wrap">
          <img src={photo.image} alt={photo.caption || "Travel photo"} />
          <button
            className={"fav-btn" + (fav ? " on" : "")}
            onClick={() => onToggleFavorite(photo.id)}
            aria-label={fav ? "Remove favorite" : "Add favorite"}
          >
            <Icon name="heart" size={22} fill={fav} />
          </button>
        </div>

        <div className="meta">
          <div className="place">{photo.place || "Somewhere lovely 🌍"}</div>
          <div className="when">{when}</div>
          {photo.animals && photo.animals.length > 0 && (
            <div className="animal-tags">
              {photo.animals.map((a) => (
                <span className="animal-tag" key={a}>
                  🐾 {a}
                </span>
              ))}
            </div>
          )}
        </div>

        <textarea
          className="caption-input"
          rows={2}
          placeholder="Add a little caption…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <div className="modal-actions">
          <button
            className="icon-btn"
            onClick={() => sharePhoto(photo)}
            aria-label="Share photo"
          >
            <Icon name="share" size={20} />
          </button>
          <button
            className="icon-btn danger"
            onClick={() => {
              if (confirm("Delete this photo?")) {
                onDelete(photo.id);
                onClose();
              }
            }}
            aria-label="Delete photo"
          >
            <Icon name="trash" size={20} />
          </button>
          <button className="btn grow" onClick={saveAndClose}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
