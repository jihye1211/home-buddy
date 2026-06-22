import { useEffect, useRef } from "react";
import type { Attendance } from "@/types";
import { notify } from "@/services/notifications";
import { notificationFor } from "@/utils/messages";

/** Minutes-before-clock-out at which to fire a reminder. */
const MILESTONES_MIN = [10, 5, 1, 0];

/** A reminder is "due" within this slack of its target, in ms. */
const SLACK_MS = 1500;

/**
 * Fires desktop notifications at 10/5/1/0 minutes before clock-out. Each
 * milestone fires at most once per attendance record (keyed by clock-out time)
 * so re-renders and refreshes don't spam the user.
 */
export function useReminders(
  attendance: Attendance | null,
  now: number,
  character: string,
): void {
  const firedRef = useRef<Set<string>>(new Set());
  const recordKeyRef = useRef<number | null>(null);

  // Reset the fired set when the underlying attendance record changes.
  if (attendance && recordKeyRef.current !== attendance.expectedClockOutAt) {
    recordKeyRef.current = attendance.expectedClockOutAt;
    firedRef.current = new Set();
  }

  useEffect(() => {
    if (!attendance) return;
    const remainingMs = attendance.expectedClockOutAt - now;

    for (const minutes of MILESTONES_MIN) {
      const targetMs = minutes * 60_000;
      const key = String(minutes);
      const isDue =
        remainingMs <= targetMs + SLACK_MS && remainingMs > targetMs - SLACK_MS;

      if (isDue && !firedRef.current.has(key)) {
        firedRef.current.add(key);
        const body = notificationFor(key);
        void notify(`${character} HomeBuddy`, body);
      }
    }
  }, [attendance, now, character]);
}
