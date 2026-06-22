import { formatHms } from "@/utils/time";

interface CountdownProps {
  remainingMs: number;
  isOvertime: boolean;
}

/**
 * The large live timer. Shows time-to-clock-out normally, or elapsed overtime
 * (prefixed "+") once clock-out has passed.
 */
export function Countdown({ remainingMs, isOvertime }: CountdownProps) {
  const label = isOvertime ? "초과근무" : "퇴근까지";
  const value = formatHms(remainingMs);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] uppercase tracking-wide text-black/40 dark:text-white/40">
        {label}
      </span>
      <span
        className={`tnum text-3xl font-semibold tabular-nums ${
          isOvertime
            ? "text-red-500 dark:text-red-400"
            : "text-black/85 dark:text-white/90"
        }`}
      >
        {isOvertime ? "+" : ""}
        {value}
      </span>
    </div>
  );
}
