import { describe, expect, test } from "vitest";
import type { ManualConfig, Settings } from "@/types";
import {
  computeManualAttendance,
  effectiveClockIn,
  resolveManualAttendance,
  validateManualConfig,
} from "./schedule";

const manual: ManualConfig = {
  clockIn: "09:00",
  mode: "duration",
  workMinutes: 9 * 60,
  clockOut: "18:00",
};

function settings(overrides: Partial<Settings> = {}): Settings {
  return {
    manual,
    referenceUrl: "",
    dailyReset: "default",
    todayClockIn: null,
    character: "🐰",
    overtimeEnabled: true,
    tray: {
      showEmoji: true,
      showTime: true,
      timeFormat: "compact",
      showPercent: false,
    },
    onboarded: true,
    ...overrides,
  };
}

describe("computeManualAttendance", () => {
  test("duration mode adds work minutes to clock-in", () => {
    const a = computeManualAttendance({ ...manual, mode: "duration" }, new Date());
    expect(a.expectedClockOutAt - a.clockInAt).toBe(9 * 3600_000);
  });

  test("fixed mode uses the explicit clock-out", () => {
    const a = computeManualAttendance(
      { ...manual, mode: "fixed", clockOut: "17:30" },
      new Date(2026, 5, 19),
    );
    const out = new Date(a.expectedClockOutAt);
    expect(out.getHours()).toBe(17);
    expect(out.getMinutes()).toBe(30);
  });
});

describe("effectiveClockIn", () => {
  test("a correction for today wins", () => {
    const s = settings({ todayClockIn: { date: "20260619", time: "09:56" } });
    expect(effectiveClockIn(s, "20260619")).toBe("09:56");
  });

  test("default policy falls back to the usual clock-in on a new day", () => {
    const s = settings({
      dailyReset: "default",
      todayClockIn: { date: "20260618", time: "10:30" },
    });
    expect(effectiveClockIn(s, "20260619")).toBe("09:00");
  });

  test("carry policy reuses yesterday's value on a new day", () => {
    const s = settings({
      dailyReset: "carry",
      todayClockIn: { date: "20260618", time: "10:30" },
    });
    expect(effectiveClockIn(s, "20260619")).toBe("10:30");
  });
});

describe("resolveManualAttendance", () => {
  test("applies today's correction to the clock-in", () => {
    const now = new Date(2026, 5, 19, 12, 0);
    const s = settings({ todayClockIn: { date: "20260619", time: "09:56" } });
    const a = resolveManualAttendance(s, now);
    const clockIn = new Date(a.clockInAt);
    expect(clockIn.getHours()).toBe(9);
    expect(clockIn.getMinutes()).toBe(56);
  });
});

describe("validateManualConfig", () => {
  test("accepts a valid config", () => {
    expect(validateManualConfig(manual)).toBeNull();
  });

  test("rejects a malformed clock-in", () => {
    expect(validateManualConfig({ ...manual, clockIn: "9am" })).not.toBeNull();
  });

  test("rejects a non-positive duration", () => {
    expect(
      validateManualConfig({ ...manual, mode: "duration", workMinutes: 0 }),
    ).not.toBeNull();
  });
});
