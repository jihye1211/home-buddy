import type { Settings } from "@/types";
import { DEFAULT_CHARACTER } from "@/utils/character";

const STORAGE_KEY = "home-buddy.settings.v1";

/** Sensible defaults for a first run: 9-to-6, 9h day, rabbit buddy. */
export const DEFAULT_SETTINGS: Settings = {
  manual: {
    clockIn: "09:30",
    mode: "duration",
    workMinutes: 9 * 60,
    clockOut: "18:30",
  },
  referenceUrl: "",
  dailyReset: "default",
  todayClockIn: null,
  character: DEFAULT_CHARACTER,
  overtimeEnabled: true,
  tray: {
    showEmoji: true,
    showTime: true,
    timeFormat: "compact",
    showPercent: false,
  },
  onboarded: false,
};

/**
 * Load settings from localStorage, deep-merging onto defaults so older or
 * partial records keep working after the schema grows.
 */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return mergeSettings(DEFAULT_SETTINGS, parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Persist settings. Returns the saved value for convenient chaining. */
export function saveSettings(settings: Settings): Settings {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  return settings;
}

function mergeSettings(base: Settings, patch: Partial<Settings>): Settings {
  return {
    ...base,
    ...patch,
    manual: { ...base.manual, ...patch.manual },
    tray: { ...base.tray, ...patch.tray },
  };
}
