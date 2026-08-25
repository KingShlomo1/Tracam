import { STORAGE_KEYS } from "./storage";

const FORMAT = "tracam-backup";
const VERSION = 1;

interface BackupFile {
  format: string;
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

/** Download every Tracam item as a single backup file. */
export function exportBackup(): void {
  const data: Record<string, unknown> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = localStorage.getItem(key);
    if (raw != null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }

  const file: BackupFile = {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(file)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tracam-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Restore from a backup file. Replaces current data and reloads the app.
 * Returns a rejected promise if the file isn't a valid Tracam backup.
 */
export function importBackup(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as BackupFile;
        if (parsed.format !== FORMAT || typeof parsed.data !== "object") {
          reject(new Error("That doesn't look like a Tracam backup file."));
          return;
        }
        const allowed = new Set<string>(Object.values(STORAGE_KEYS));
        for (const [key, value] of Object.entries(parsed.data)) {
          if (allowed.has(key)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
        resolve();
      } catch {
        reject(new Error("Couldn't read that backup file."));
      }
    };
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsText(file);
  });
}
