import { describe, expect, test } from "vitest";
import type { AttendanceStatus, TraySettings } from "@/types";
import { formatClockDuration, formatTrayTitle } from "./trayTitle";

const baseTray: TraySettings = {
  showEmoji: true,
  showTime: true,
  timeFormat: "compact",
  showPercent: false,
};

function status(overrides: Partial<AttendanceStatus> = {}): AttendanceStatus {
  return {
    attendance: { clockInAt: 0, expectedClockOutAt: 0, source: "manual" },
    phase: "working",
    progress: 0.5,
    remainingMs: 2 * 3600_000 + 13 * 60_000, // 2h13m
    isOvertime: false,
    ...overrides,
  };
}

describe("formatClockDuration", () => {
  test("includes seconds when asked", () => {
    expect(formatClockDuration(2 * 3600_000 + 13 * 60_000 + 22_000, true)).toBe(
      "2:13:22",
    );
  });

  test("omits seconds otherwise, hours not zero-padded", () => {
    expect(formatClockDuration(2 * 3600_000 + 5 * 60_000, false)).toBe("2:05");
  });
});

describe("formatTrayTitle", () => {
  test("compact time with emoji by default", () => {
    expect(formatTrayTitle(status(), "🐰", baseTray)).toBe("🐰 2h 13m");
  });

  test("uses the chosen character as the menu bar emoji", () => {
    expect(formatTrayTitle(status(), "🦊", baseTray)).toBe("🦊 2h 13m");
  });

  test("hides the emoji when disabled", () => {
    expect(formatTrayTitle(status(), "🐰", { ...baseTray, showEmoji: false })).toBe(
      "2h 13m",
    );
  });

  test("counts down seconds in the final minute", () => {
    const s = status({ remainingMs: 11_000 });
    expect(formatTrayTitle(s, "🐰", baseTray)).toBe("🐰 11s");
  });

  test("hm format omits seconds", () => {
    const tray = { ...baseTray, timeFormat: "hm" as const };
    expect(formatTrayTitle(status(), "🐰", tray)).toBe("🐰 2:13");
  });

  test("hms format includes seconds", () => {
    const tray = { ...baseTray, timeFormat: "hms" as const };
    expect(formatTrayTitle(status(), "🐰", tray)).toBe("🐰 2:13:00");
  });

  test("percent only when time is off", () => {
    const tray = { ...baseTray, showTime: false, showPercent: true };
    expect(formatTrayTitle(status({ progress: 0.83 }), "🐰", tray)).toBe("🐰 83%");
  });

  test("time and percent together", () => {
    const tray = { ...baseTray, showPercent: true };
    expect(formatTrayTitle(status({ progress: 0.5 }), "🐰", tray)).toBe(
      "🐰 2h 13m 50%",
    );
  });

  test("overtime prefixes a plus sign", () => {
    const s = status({ isOvertime: true, remainingMs: -20 * 60_000, phase: "overtime" });
    expect(formatTrayTitle(s, "🐰", baseTray)).toBe("🔥 +20m");
  });

  test("overtime emoji escalates past 30 minutes", () => {
    const s = status({ isOvertime: true, remainingMs: -42 * 60_000, phase: "overtime" });
    expect(formatTrayTitle(s, "🐰", baseTray)).toBe("🫠 +42m");
  });

  test("falls back to the character when everything is disabled", () => {
    const tray = {
      ...baseTray,
      showEmoji: false,
      showTime: false,
      showPercent: false,
    };
    expect(formatTrayTitle(status(), "🐰", tray)).toBe("🐰");
  });
});
