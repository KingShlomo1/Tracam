import type { Trail } from "./types";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "trail"
  );
}

/** Turn a recorded trail into a standard GPX 1.1 document. */
export function trailToGpx(trail: Trail): string {
  const pts = trail.points
    .map(
      (p) =>
        `      <trkpt lat="${p.lat}" lon="${p.lng}"><time>${new Date(
          p.t
        ).toISOString()}</time></trkpt>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Tracam" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(trail.name)}</name>
    <time>${new Date(trail.startedAt).toISOString()}</time>
  </metadata>
  <trk>
    <name>${escapeXml(trail.name)}</name>
    <trkseg>
${pts}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Share a trail as a .gpx file via the native share sheet when possible,
 * otherwise fall back to downloading the file.
 */
export async function shareTrailGpx(trail: Trail): Promise<void> {
  const gpx = trailToGpx(trail);
  const filename = `${slug(trail.name)}.gpx`;
  const nav = navigator as any;

  // Try the native share sheet with the file attached (mobile).
  try {
    const file = new File([gpx], filename, { type: "application/gpx+xml" });
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: trail.name });
      return;
    }
  } catch (err: any) {
    if (err && err.name === "AbortError") return; // user cancelled
    // otherwise fall through to download
  }

  // Fallback: download the file.
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
