import { describe, expect, test } from "vitest";
import type { Attendance } from "@/types";
import { deriveStatus } from "./status";

/** Build an attendance record clocking in at `inHour` for `hours` hours. */
function attendanceAt(inHour: number, hours: number): Attendance {
  const clockInAt = new Date(2026, 5, 19, inHour, 0, 0, 0).getTime();
  return {
    clockInAt,
    expectedClockOutAt: clockInAt + hours * 3600_000,
    source: "manual",
  };
}

describe("deriveStatus", () => {
  test("before clock-in reports the before-work phase", () => {
    const a = attendanceAt(9, 9);
    const status = deriveStatus(a, a.clockInAt - 60 * 60_000);
    expect(status.phase).toBe("before-work");
    expect(status.progress).toBe(0);
    expect(status.isOvertime).toBe(false);
  });

  test("midway through reports partial progress", () => {
    const a = attendanceAt(9, 10); // 09:00 → 19:00
    const noon = new Date(2026, 5, 19, 14, 0).getTime();
    const status = deriveStatus(a, noon);
    expect(status.progress).toBeCloseTo(0.5, 2);
    expect(status.isOvertime).toBe(false);
  });

  test("within 15 minutes of clock-out reports the soon phase", () => {
    const a = attendanceAt(9, 9);
    const status = deriveStatus(a, a.expectedClockOutAt - 10 * 60_000);
    expect(status.phase).toBe("soon");
  });

  test("past clock-out reports overtime with negative remaining", () => {
    const a = attendanceAt(9, 9);
    const status = deriveStatus(a, a.expectedClockOutAt + 30 * 60_000);
    expect(status.phase).toBe("overtime");
    expect(status.isOvertime).toBe(true);
    expect(status.remainingMs).toBeLessThan(0);
    expect(status.progress).toBe(1);
  });

  test("lunch hour reports the lunch phase", () => {
    const a = attendanceAt(9, 9); // 09:00 → 18:00
    const lunch = new Date(2026, 5, 19, 12, 30).getTime();
    const status = deriveStatus(a, lunch);
    expect(status.phase).toBe("lunch");
  });
});
