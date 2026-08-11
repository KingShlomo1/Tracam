// Rasterises scripts/icon.svg into the PNG icons the PWA manifest needs.
// Run with: node scripts/gen-icons.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(here, "icon.svg"));
const out = join(here, "..", "public");

const RED = { r: 247, g: 108, b: 108, alpha: 1 };

async function render(size, name, padding = 0) {
  const inner = Math.round(size * (1 - padding));
  const badge = await sharp(svg).resize(inner, inner).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: padding > 0 ? RED : { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: badge, gravity: "center" }])
    .png()
    .toFile(join(out, name));
  console.log("wrote", name);
}

await render(192, "icon-192.png");
await render(512, "icon-512.png");
// Maskable icon: full-bleed soft-red background with safe padding.
await render(512, "icon-maskable.png", 0.2);
// Apple touch icon.
await render(180, "apple-touch-icon.png");
// Favicon.
await render(64, "favicon.png");
