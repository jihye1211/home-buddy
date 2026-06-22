import type { Attendance, AttendanceStatus, DayPhase } from "@/types";

/**
 * "Soon" window before clock-out, in milliseconds. Inside this window the
 * buddy starts watching the clock (👀).
 */
const SOON_MS = 15 * 60_000;

/** Lunch window expressed as wall-clock hours [start, end). */
const LUNCH_START_HOUR = 12;
const LUNCH_END_HOUR = 13;

/** Progress past this fraction (but before "soon") reads as "afternoon". */
const AFTERNOON_THRESHOLD = 0.6;

/**
 * Derive everything the UI needs from an Attendance record at a given instant.
 * Pure: pass `now` explicitly so it can be tested deterministically.
 */
export function deriveStatus(
  attendance: Attendance,
  now: number,
): AttendanceStatus {
  const { clockInAt, expectedClockOutAt } = attendance;
  const span = Math.max(1, expectedClockOutAt - clockInAt);

  const remainingMs = expectedClockOutAt - now;
  const isOvertime = remainingMs <= 0;
  const progress = clamp01((now - clockInAt) / span);
  const phase = derivePhase({ attendance, now, remainingMs, progress });

  return { attendance, phase, progress, remainingMs, isOvertime };
}

interface PhaseInput {
  attendance: Attendance;
  now: number;
  remainingMs: number;
  progress: number;
}

function derivePhase({
  attendance,
  now,
  remainingMs,
  progress,
}: PhaseInput): DayPhase {
  if (now < attendance.clockInAt) return "before-work";
  if (remainingMs <= 0) return "overtime";
  if (remainingMs <= SOON_MS) return "soon";

  const hour = new Date(now).getHours();
  if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) return "lunch";

  if (progress >= AFTERNOON_THRESHOLD) return "afternoon";
  return "working";
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
