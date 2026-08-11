import { useState } from "react";
import type { Photo } from "../types";

interface Props {
  photo: Photo;
  onClose: () => void;
  onSaveCaption: (id: string, caption: string) => void;
  onDelete: (id: string) => void;
}

export default function PhotoModal({
  photo,
  onClose,
  onSaveCaption,
  onDelete,
}: Props) {
  const [caption, setCaption] = useState(photo.caption ?? "");

  const when = new Date(photo.takenAt).toLocaleDateString(undefined, {
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
        <img src={photo.image} alt={photo.caption || "Travel photo"} />
        <div className="meta">
          <div className="place">{photo.place || "Somewhere lovely 🌍"}</div>
          <div className="when">{when}</div>
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
            className="btn danger"
            onClick={() => {
              if (confirm("Delete this photo?")) {
                onDelete(photo.id);
                onClose();
              }
            }}
          >
            Delete
          </button>
          <button className="btn" onClick={saveAndClose}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
