import { motion } from "framer-motion";
import type { AttendanceStatus, Settings } from "@/types";
import { formatClock } from "@/utils/time";
import { messageForPhase } from "@/utils/messages";
import { openUrl } from "@/services/opener";
import { IconGear, IconInfo, IconExternal } from "@/components/ui/icons";
import { CharacterFace } from "./CharacterFace";
import { ProgressBar } from "./ProgressBar";
import { Countdown } from "./Countdown";

interface PopoverProps {
  status: AttendanceStatus;
  settings: Settings;
  /** Set today's clock-in after the user checks/corrects it. "HH:mm". */
  onCorrectClockIn: (time: string) => void;
  onOpenSettings: () => void;
}

/** The card shown when the menu bar item is clicked. */
export function Popover({
  status,
  settings,
  onCorrectClockIn,
  onOpenSettings,
}: PopoverProps) {
  const { attendance, phase, progress, remainingMs, isOvertime } = status;
  const overtimeMs = isOvertime ? -remainingMs : 0;
  const message = isOvertime
    ? messageForPhase("overtime")
    : messageForPhase(phase);

  return (
    <motion.div
      className="glass-surface flex w-full flex-col gap-4 rounded-popover p-5"
      initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="flex flex-col items-center gap-2">
        <CharacterFace
          character={settings.character}
          phase={isOvertime ? "overtime" : phase}
          overtimeMs={overtimeMs}
        />
        <p className="text-sm font-medium text-black/70 dark:text-white/70">
          {isOvertime ? "야근 중..." : message}
        </p>
      </header>

      <Divider />

      <div className="grid grid-cols-2 gap-3 text-center">
        <ClockInStat
          value={formatClock(attendance.clockInAt)}
          onChange={onCorrectClockIn}
        />
        <TimeStat label="퇴근" value={formatClock(attendance.expectedClockOutAt)} />
      </div>

      <ReferenceLink url={settings.referenceUrl} />

      <Divider />

      <ProgressBar value={progress} overtime={isOvertime} />

      <Divider />

      <Countdown remainingMs={remainingMs} isOvertime={isOvertime} />

      <footer className="mt-1 flex items-center justify-end">
        <IconButton label="설정" onClick={onOpenSettings}>
          <IconGear />
        </IconButton>
      </footer>
    </motion.div>
  );
}

/**
 * Editable clock-in. Displays a plain 24h time (consistent with 퇴근, no AM/PM
 * or picker icon); a transparent native time input is layered on top so a click
 * still opens the OS time picker to correct today's value.
 */
function ClockInStat({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="group relative flex cursor-pointer flex-col gap-0.5">
      <span className="text-[11px] text-black/40 dark:text-white/40">출근</span>
      <span className="tnum text-lg font-semibold text-black/85 transition group-hover:text-sky-600 dark:text-white/90 dark:group-hover:text-sky-300">
        {value}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        aria-label="오늘 출근 시간 보정"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  );
}

function TimeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-black/40 dark:text-white/40">
        {label}
      </span>
      <span className="tnum text-lg font-semibold text-black/85 dark:text-white/90">
        {value}
      </span>
    </div>
  );
}

/** Link to the user's attendance page, with an info tooltip explaining why. */
function ReferenceLink({ url }: { url: string }) {
  if (!url.trim()) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px]">
      <button
        type="button"
        onClick={() => void openUrl(url)}
        className="inline-flex items-center gap-1 font-medium text-sky-600 transition hover:underline dark:text-sky-300"
      >
        출근일시 확인하기
        <IconExternal size={12} />
      </button>
      <span className="group relative inline-flex">
        <IconInfo
          size={13}
          className="text-black/30 transition hover:text-black/55 dark:text-white/30 dark:hover:text-white/55"
        />
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 w-max max-w-[180px] -translate-x-1/2 rounded-md bg-black/85 px-2 py-1 text-[10px] leading-snug text-white opacity-0 shadow-lg transition group-hover:opacity-100 dark:bg-white/90 dark:text-black">
          출근일시를 확인하여 입력해주세요.
        </span>
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-black/8 dark:bg-white/10" />;
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-black/45 transition hover:bg-black/5 hover:text-black/75 active:scale-90 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white/80"
    >
      {children}
    </button>
  );
}
