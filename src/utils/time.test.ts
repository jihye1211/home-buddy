import { describe, expect, test } from "vitest";
import {
  formatClock,
  formatCompact,
  formatHms,
  hhMmToEpoch,
  isValidHhMm,
  parseHhMm,
} from "./time";

describe("parseHhMm", () => {
  test("parses a valid 24h time", () => {
    expect(parseHhMm("09:30")).toEqual({ hours: 9, minutes: 30 });
  });

  test("parses single-digit hours", () => {
    expect(parseHhMm("9:05")).toEqual({ hours: 9, minutes: 5 });
  });

  test("throws on out-of-range hour", () => {
    expect(() => parseHhMm("24:00")).toThrow();
  });

  test("throws on garbage", () => {
    expect(() => parseHhMm("abc")).toThrow();
  });
});

describe("isValidHhMm", () => {
  test("true for valid, false for invalid", () => {
    expect(isValidHhMm("18:00")).toBe(true);
    expect(isValidHhMm("99:99")).toBe(false);
  });
});

describe("hhMmToEpoch", () => {
  test("resolves against the reference day's date", () => {
    const ref = new Date(2026, 5, 19, 0, 0, 0, 0);
    const epoch = hhMmToEpoch("09:30", ref);
    const d = new Date(epoch);
    expect(d.getHours()).toBe(9);
    expect(d.getMinutes()).toBe(30);
    expect(d.getDate()).toBe(19);
  });
});

describe("formatHms", () => {
  test("formats hours, minutes, seconds zero-padded", () => {
    expect(formatHms(2 * 3600_000 + 13 * 60_000 + 22_000)).toBe("02:13:22");
  });

  test("clamps negatives to absolute value", () => {
    expect(formatHms(-65_000)).toBe("00:01:05");
  });
});

describe("formatCompact", () => {
  test("drops the hour segment when zero", () => {
    expect(formatCompact(42 * 60_000)).toBe("42m");
  });

  test("includes hours when present, with a space and padded minutes", () => {
    expect(formatCompact(2 * 3600_000 + 13 * 60_000)).toBe("2h 13m");
    expect(formatCompact(4 * 3600_000 + 2 * 60_000)).toBe("4h 02m");
  });
});

describe("formatClock", () => {
  test("formats epoch as local HH:mm", () => {
    const epoch = new Date(2026, 5, 19, 18, 52).getTime();
    expect(formatClock(epoch)).toBe("18:52");
  });
});
