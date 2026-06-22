/** Pure time helpers. No side effects, no Date.now() inside formatters. */

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;

/** Parse "HH:mm" into { hours, minutes }. Throws on malformed input. */
export function parseHhMm(value: string): { hours: number; minutes: number } {
  const match = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid time "${value}", expected HH:mm`);
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

/** True if "HH:mm" is well-formed. */
export function isValidHhMm(value: string): boolean {
  try {
    parseHhMm(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve an "HH:mm" against a reference day, returning epoch ms for that
 * time on the same calendar date as `ref`.
 */
export function hhMmToEpoch(value: string, ref: Date = new Date()): number {
  const { hours, minutes } = parseHhMm(value);
  const d = new Date(ref);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

/**
 * Format a millisecond duration as "HH:MM:SS". Negative inputs are clamped to
 * zero magnitude by the caller; this formats the absolute value.
 */
export function formatHms(ms: number): string {
  const total = Math.max(0, Math.floor(Math.abs(ms) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * Compact duration for the menu bar, e.g. "4h 02m" or "42m". Drops the hour
 * segment when zero so the tray title stays short; minutes are zero-padded when
 * hours are shown.
 */
export function formatCompact(ms: number): string {
  const total = Math.max(0, Math.floor(Math.abs(ms) / MINUTE_MS));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

/** Format epoch ms as "HH:mm" in local time. */
export function formatClock(epoch: number): string {
  const d = new Date(epoch);
  return [d.getHours(), d.getMinutes()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

/** Local calendar day as "YYYYMMDD", used to key per-day state. */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}
