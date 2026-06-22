import type { DayPhase } from "@/types";

/** Encouraging copy shown in the popover header, by phase. */
const PHASE_MESSAGES: Record<DayPhase, string[]> = {
  "before-work": ["아직 출근 전이에요 😴", "좋은 아침! 천천히 시작해요"],
  working: ["오늘도 화이팅!", "잘하고 있어요 💪", "한 걸음씩!"],
  lunch: ["맛있는 점심 드세요 🍱", "밥은 챙겨 먹었나요?"],
  afternoon: ["커피 한 잔 어때요? ☕", "오후도 힘내요!", "거의 다 왔어요"],
  soon: ["퇴근이 코앞이에요 👀", "조금만 더!", "마무리 준비!"],
  done: ["야호! 퇴근! 🎉", "오늘도 고생했어요 ☕", "집 갈 준비!"],
  overtime: [
    "아직 회사인가요?",
    "커피 한 잔 하실래요?",
    "허리를 펴주세요.",
    "집이 당신을 기다리고 있어요.",
    "이제 진짜 퇴근해야 하지 않을까요?",
  ],
};

/** Notification body copy, keyed by how close clock-out is. */
export const NOTIFICATION_MESSAGES: Record<string, string[]> = {
  "10": ["곧 퇴근이에요!", "10분 뒤면 자유예요 ☕"],
  "5": ["5분 남았어요!", "마무리할 시간이에요"],
  "1": ["퇴근 1분 전!", "거의 다 왔어요 👀"],
  "0": ["오늘의 노동이 끝났습니다.", "야호! 퇴근! 🎉", "오늘도 고생했어요 ☕"],
};

/** Pick a deterministic-ish message for a phase (rotates by minute). */
export function messageForPhase(phase: DayPhase, seed = Date.now()): string {
  const pool = PHASE_MESSAGES[phase];
  const index = Math.floor(seed / 60_000) % pool.length;
  return pool[index];
}

/** Pick a random notification body for a milestone ("10" | "5" | "1" | "0"). */
export function notificationFor(milestone: string): string {
  const pool = NOTIFICATION_MESSAGES[milestone] ?? NOTIFICATION_MESSAGES["0"];
  return pool[Math.floor(Math.random() * pool.length)];
}
