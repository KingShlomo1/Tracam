/**
 * Downscale + compress an image (from a canvas, blob, or data URL) into a
 * JPEG data URL small enough to comfortably live in localStorage.
 */
const MAX_SIDE = 1280;
const QUALITY = 0.72;

export function compressDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(drawToJpeg(img));
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export function compressFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => compressDataUrl(String(reader.result)).then(resolve);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function drawToJpeg(img: HTMLImageElement): string {
  let { width, height } = img;
  if (width > height && width > MAX_SIDE) {
    height = Math.round((height * MAX_SIDE) / width);
    width = MAX_SIDE;
  } else if (height >= width && height > MAX_SIDE) {
    width = Math.round((width * MAX_SIDE) / height);
    height = MAX_SIDE;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", QUALITY);
}
