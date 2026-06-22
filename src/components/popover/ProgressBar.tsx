import { motion } from "framer-motion";

interface ProgressBarProps {
  /** 0..1 progress. */
  value: number;
  /** Whether overtime styling (warm) should apply. */
  overtime?: boolean;
}

/**
 * A rounded progress track that fills smoothly. Switches to a warm gradient in
 * overtime to signal "past clock-out".
 */
export function ProgressBar({ value, overtime = false }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={
            overtime
              ? "h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
              : "h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
          }
          initial={false}
          animate={{ width: `${overtime ? 100 : pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-black/45 dark:text-white/45">
        <span>오늘의 노동</span>
        <span className="tnum font-medium text-black/60 dark:text-white/60">
          {overtime ? "100%" : `${pct}%`}
        </span>
      </div>
    </div>
  );
}
