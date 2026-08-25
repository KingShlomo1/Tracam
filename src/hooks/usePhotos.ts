import { useCallback, useEffect, useState } from "react";
import type { Photo } from "../types";
import { loadPhotos, savePhotos } from "../storage";

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>(() => loadPhotos());

  // Persist whenever the collection changes.
  useEffect(() => {
    savePhotos(photos);
  }, [photos]);

  const addPhoto = useCallback((photo: Photo) => {
    setPhotos((prev) => [photo, ...prev]);
  }, []);

  const updatePhoto = useCallback((id: string, patch: Partial<Photo>) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removeMany = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setPhotos((prev) => prev.filter((p) => !set.has(p.id)));
  }, []);

  return { photos, addPhoto, updatePhoto, removePhoto, removeMany };
}
