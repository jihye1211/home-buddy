/**
 * Core domain types for HomeBuddy.
 *
 * The app revolves around a single daily Attendance record: when you clocked
 * in, and when you are expected to clock out. Everything else (countdown,
 * progress, overtime, character mood) is derived from that.
 */

/** A single day's attendance facts. */
export interface Attendance {
  /** Local clock-in time as epoch milliseconds. */
  clockInAt: number;
  /** Expected clock-out time as epoch milliseconds. */
  expectedClockOutAt: number;
  /** Always manual — the user enters and corrects times themselves. */
  source: "manual";
}

/** The user's usual schedule, repeated each day as a starting point. */
export interface ManualConfig {
  /** Default clock-in time as "HH:mm" (24h). */
  clockIn: string;
  /**
   * How the clock-out is derived. Either a fixed clock-out time or a work
   * duration added to the clock-in.
   */
  mode: "duration" | "fixed";
  /** Work duration in minutes, used when mode === "duration". */
  workMinutes: number;
  /** Clock-out time as "HH:mm" (24h), used when mode === "fixed". */
  clockOut: string;
}

/**
 * What today's clock-in starts from each new day:
 * - "default": reset to the usual clock-in (ManualConfig.clockIn) every day.
 * - "carry": reuse the last value the user set/corrected.
 */
export type DailyReset = "default" | "carry";

/** A clock-in the user set for a specific day (a correction). */
export interface DailyClockIn {
  /** The day this applies to, as "YYYYMMDD" (local). */
  date: string;
  /** Clock-in time as "HH:mm" (24h). */
  time: string;
}

/** How the remaining time is rendered in the tray: 2h13m · 2:13 · 2:13:22. */
export type TimeFormat = "compact" | "hm" | "hms";

/** How the menu bar (tray) title is composed. */
export interface TraySettings {
  /** Prefix the title with the phase/character emoji. */
  showEmoji: boolean;
  /** Show the remaining (or overtime) time. */
  showTime: boolean;
  /** Time rendering: "compact" → 2h13m · "hm" → 2:13 · "hms" → 2:13:22. */
  timeFormat: TimeFormat;
  /** Show the workday progress percentage. */
  showPercent: boolean;
}

/** Persisted user settings. */
export interface Settings {
  /** Usual schedule used as the daily default. */
  manual: ManualConfig;
  /**
   * Optional URL where the user checks their real attendance (e.g. groupware).
   * Stored locally only; the app links to it so corrections are easy.
   */
  referenceUrl: string;
  /** How today's clock-in starts each new day. */
  dailyReset: DailyReset;
  /** The clock-in the user set for a given day, if any (a correction). */
  todayClockIn: DailyClockIn | null;
  /** Buddy emoji shown across the UI and notifications. */
  character: string;
  /** Whether overtime mode is allowed to activate past clock-out. */
  overtimeEnabled: boolean;
  /** Menu bar title format. */
  tray: TraySettings;
  /** Whether onboarding has been completed. */
  onboarded: boolean;
}

/** The phase of the day, used to pick a character face and copy. */
export type DayPhase =
  | "before-work"
  | "working"
  | "lunch"
  | "afternoon"
  | "soon"
  | "done"
  | "overtime";

/** Everything the UI needs for a given instant, derived from Attendance. */
export interface AttendanceStatus {
  attendance: Attendance;
  /** Current phase of the day. */
  phase: DayPhase;
  /** 0..1 progress through the workday (clamped). */
  progress: number;
  /** Milliseconds until clock-out; negative once in overtime. */
  remainingMs: number;
  /** True once expectedClockOutAt has passed. */
  isOvertime: boolean;
}
