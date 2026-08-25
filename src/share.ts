import type { Photo } from "./types";

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(head)?.[1] || "image/jpeg";
  const bytes = atob(body);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Share a photo via the native share sheet (with the image attached where the
 * browser supports it), falling back to downloading the image.
 */
export async function sharePhoto(photo: Photo): Promise<void> {
  const blob = dataUrlToBlob(photo.image);
  const filename = `tracam-${photo.id}.jpg`;
  const text = photo.caption || photo.place || "A memory from Tracam 🍓";
  const nav = navigator as any;

  try {
    const file = new File([blob], filename, { type: blob.type });
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], text });
      return;
    }
    if (nav.share) {
      await nav.share({ text });
      return;
    }
  } catch (err: any) {
    if (err && err.name === "AbortError") return;
  }

  // Fallback: download the image.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
