import { useEffect, useRef } from "react";

/**
 * Keeps the screen awake while `enabled` is true, using the Screen Wake Lock
 * API. Wake locks are dropped when a tab is hidden, so we re-acquire when the
 * page becomes visible again. Silently does nothing on unsupported browsers.
 */
export function useWakeLock(enabled: boolean): void {
  const lockRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    const nav = navigator as any;

    async function acquire() {
      if (!("wakeLock" in nav)) return;
      try {
        lockRef.current = await nav.wakeLock.request("screen");
      } catch {
        /* denied or not allowed right now */
      }
    }

    function release() {
      try {
        lockRef.current?.release?.();
      } catch {
        /* ignore */
      }
      lockRef.current = null;
    }

    function onVisibility() {
      if (!cancelled && enabled && document.visibilityState === "visible") {
        acquire();
      }
    }

    if (enabled) {
      acquire();
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      release();
    };
  }, [enabled]);
}
