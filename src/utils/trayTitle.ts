import type { AttendanceStatus, TraySettings } from "@/types";
import { formatCompact } from "./time";
import { trayEmojiForPhase } from "./character";

/**
 * Duration as a clock, e.g. "2:13:22" or (without seconds) "2:13". Hours are
 * not zero-padded so the tray title stays short; minutes/seconds are.
 */
export function formatClockDuration(ms: number, showSeconds: boolean): string {
  const total = Math.max(0, Math.floor(Math.abs(ms) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  return showSeconds ? `${h}:${mm}:${String(s).padStart(2, "0")}` : `${h}:${mm}`;
}

/**
 * Compose the menu bar title from live status and the user's tray format.
 * Never returns an empty string — falls back to the buddy emoji so the tray is
 * always clickable.
 */
export function formatTrayTitle(
  status: AttendanceStatus,
  character: string,
  tray: TraySettings,
): string {
  const overtimeMs = status.isOvertime ? -status.remainingMs : 0;
  const emoji = tray.showEmoji
    ? trayEmojiForPhase(status.phase, character, overtimeMs)
    : "";

  const segments: string[] = [];

  if (tray.showTime) {
    const magnitude = status.isOvertime ? -status.remainingMs : status.remainingMs;
    let time: string;
    if (!status.isOvertime && magnitude < 60_000) {
      // Final minute: count down the seconds right in the menu bar.
      time = `${Math.max(0, Math.ceil(magnitude / 1000))}s`;
    } else if (tray.timeFormat === "compact") {
      time = formatCompact(magnitude);
    } else {
      time = formatClockDuration(magnitude, tray.timeFormat === "hms");
    }
    segments.push(status.isOvertime ? `+${time}` : time);
  }

  if (tray.showPercent) {
    segments.push(`${Math.round(status.progress * 100)}%`);
  }

  const title = [emoji, segments.join(" ")].filter(Boolean).join(" ").trim();
  return title || character;
}
