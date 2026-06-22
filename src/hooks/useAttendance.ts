import { useMemo } from "react";
import type { Attendance, Settings } from "@/types";
import { resolveManualAttendance } from "@/utils/schedule";

/**
 * Today's attendance, derived from settings (the usual schedule plus any
 * correction / daily-reset policy). Recomputed when settings change; the live
 * countdown comes from re-deriving status against the clock each second.
 */
export function useAttendance(settings: Settings): Attendance {
  return useMemo(
    () => resolveManualAttendance(settings, new Date()),
    [settings],
  );
}
