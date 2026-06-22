import { useEffect, useRef } from "react";
import type { AttendanceStatus } from "@/types";
import { setRunSpeed } from "@/services/runner";

/**
 * Map the live status to a run speed (fps) for the menu bar buddy:
 * - idle (0) before work and once home,
 * - a gentle jog that quickens as the day progresses (3 → 10),
 * - a frantic sprint during overtime that escalates with the minutes.
 */
function fpsFor(status: AttendanceStatus | null): number {
  if (!status) return 0;
  if (status.phase === "before-work" || status.phase === "done") return 0;
  if (status.isOvertime) {
    const overtimeMin = -status.remainingMs / 60_000;
    return Math.min(16, 9 + overtimeMin / 8);
  }
  return 3 + status.progress * 7;
}

/** Drive the native menu bar animation speed from status, throttled to changes. */
export function useRunner(status: AttendanceStatus | null): void {
  const lastFps = useRef<number>(-1);

  useEffect(() => {
    // Quantize to 0.5 fps so we only invoke when the speed meaningfully changes.
    const fps = Math.round(fpsFor(status) * 2) / 2;
    if (fps !== lastFps.current) {
      lastFps.current = fps;
      void setRunSpeed(fps);
    }
  }, [status]);
}
