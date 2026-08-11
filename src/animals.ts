/**
 * Automatic animal detection.
 *
 * Uses TensorFlow.js + the COCO-SSD object detector, loaded lazily so it never
 * slows down the rest of the app. The model recognises these animals out of the
 * box — including elephants, which is perfect for a trip to Thailand. 🐘
 */

const ANIMAL_CLASSES = new Set([
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
]);

// Cache the loaded model so we only build it once.
let modelPromise: Promise<any> | null = null;

async function getModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      // Registers the tf backends (webgl/cpu).
      await import("@tensorflow/tfjs");
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      // The small model is plenty for "is this an animal?" and downloads fast.
      return cocoSsd.load({ base: "lite_mobilenet_v2" });
    })();
  }
  return modelPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Returns the distinct animal kinds detected in the image (may be empty).
 * Throws if the model can't be loaded (e.g. offline) — callers should catch.
 */
export async function detectAnimals(imageSrc: string): Promise<string[]> {
  const model = await getModel();
  const img = await loadImage(imageSrc);
  const predictions: Array<{ class: string; score: number }> =
    await model.detect(img);
  const found = predictions
    .filter((p) => p.score > 0.5 && ANIMAL_CLASSES.has(p.class))
    .map((p) => p.class);
  return Array.from(new Set(found));
}

/** Is the animal-detection model even reachable? (network + module load) */
export async function canDetect(): Promise<boolean> {
  try {
    await getModel();
    return true;
  } catch {
    return false;
  }
}
