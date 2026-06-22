import type { DayPhase } from "@/types";

/** Suggested buddy emojis offered in onboarding/settings. */
export const CHARACTER_PRESETS = [
  "🐰",
  "🐯",
  "🐻",
  "🐱",
  "🦊",
  "🐶",
  "🐼",
  "🐧",
  "🐸",
  "🦦",
  "🦥",
  "☕",
  "🌙",
  "✨",
];

export const DEFAULT_CHARACTER = "🐰";

/**
 * A small expression emoji that pairs with the buddy to convey mood for the
 * current phase. The UI renders `${face}${character}`, e.g. "💻🐰".
 */
const PHASE_FACE: Record<DayPhase, string> = {
  "before-work": "😴",
  working: "💻",
  lunch: "🍱",
  afternoon: "☕",
  soon: "👀",
  done: "🎉",
  overtime: "😵",
};

/**
 * Overtime gets progressively more dramatic the longer it runs. Index by how
 * many "stages" of overtime have elapsed.
 */
const OVERTIME_FACES = ["😵", "🫠", "💀"];

/** Minutes of overtime per escalating face stage. */
const OVERTIME_STAGE_MINUTES = 30;

/** The expression emoji for a phase, escalating during overtime. */
export function faceForPhase(phase: DayPhase, overtimeMs = 0): string {
  if (phase !== "overtime") return PHASE_FACE[phase];

  const stage = Math.min(
    OVERTIME_FACES.length - 1,
    Math.floor(overtimeMs / (OVERTIME_STAGE_MINUTES * 60_000)),
  );
  return OVERTIME_FACES[stage];
}

/** The standalone tray emoji (no expression) for a phase. */
export function trayEmojiForPhase(phase: DayPhase, overtimeMs = 0): string {
  if (phase === "overtime") {
    return overtimeMs >= OVERTIME_STAGE_MINUTES * 60_000 ? "🫠" : "🔥";
  }
  if (phase === "done") return "🎉";
  return "🐰";
}
