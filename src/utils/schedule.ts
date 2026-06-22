import type { Attendance, ManualConfig, Settings } from "@/types";
import { hhMmToEpoch, parseHhMm, todayKey } from "./time";

/**
 * The clock-in time to use for `today`, honoring any correction the user made
 * and the daily-reset policy:
 * - a correction for today always wins;
 * - otherwise "carry" reuses the last set value, "default" falls back to the
 *   usual clock-in.
 */
export function effectiveClockIn(settings: Settings, today: string): string {
  const set = settings.todayClockIn;
  if (set && set.date === today) return set.time;
  if (settings.dailyReset === "carry" && set) return set.time;
  return settings.manual.clockIn;
}

/** Compute today's attendance from a resolved schedule. Pure. */
export function computeManualAttendance(
  config: ManualConfig,
  now: Date,
): Attendance {
  const clockInAt = hhMmToEpoch(config.clockIn, now);
  return {
    clockInAt,
    expectedClockOutAt: resolveClockOut(config, clockInAt, now),
    source: "manual",
  };
}

/** Resolve today's attendance from settings (correction + reset applied). */
export function resolveManualAttendance(
  settings: Settings,
  now: Date = new Date(),
): Attendance {
  const clockIn = effectiveClockIn(settings, todayKey(now));
  return computeManualAttendance({ ...settings.manual, clockIn }, now);
}

function resolveClockOut(
  config: ManualConfig,
  clockInAt: number,
  now: Date,
): number {
  if (config.mode === "fixed") {
    const out = hhMmToEpoch(config.clockOut, now);
    // Guard a clock-out earlier than clock-in (typo / overnight): keep a
    // positive same-day span.
    return out > clockInAt ? out : clockInAt + config.workMinutes * 60_000;
  }
  return clockInAt + config.workMinutes * 60_000;
}

/** Validate a ManualConfig, returning a human-readable error or null. */
export function validateManualConfig(config: ManualConfig): string | null {
  try {
    parseHhMm(config.clockIn);
  } catch {
    return "출근 시간 형식이 올바르지 않아요 (HH:mm)";
  }

  if (config.mode === "fixed") {
    try {
      parseHhMm(config.clockOut);
    } catch {
      return "퇴근 시간 형식이 올바르지 않아요 (HH:mm)";
    }
  } else if (config.workMinutes <= 0) {
    return "근무 시간은 0보다 커야 해요";
  }

  return null;
}
