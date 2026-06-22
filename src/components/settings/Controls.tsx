/** Small reusable settings controls: a labelled switch and a segmented picker. */

interface ToggleRowProps {
  label: string;
  hint?: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
}

/** A compact row with a title (+ optional hint) and an iOS-style switch. */
export function ToggleRow({ label, hint, enabled, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="flex items-center justify-between gap-3 rounded-lg px-1 py-0.5 text-left transition hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
    >
      <span className="flex flex-col">
        <span className="text-xs font-medium text-black/75 dark:text-white/80">
          {label}
        </span>
        {hint && (
          <span className="text-[10px] text-black/40 dark:text-white/40">
            {hint}
          </span>
        )}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          enabled ? "bg-sky-500" : "bg-black/15 dark:bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            enabled ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { id: T; label: string }[];
  onChange: (next: T) => void;
}

/** A pill segmented control for a small set of mutually exclusive options. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`flex-1 rounded-md py-1 text-xs font-medium transition ${
            value === opt.id
              ? "bg-white text-black shadow-sm dark:bg-white/15 dark:text-white"
              : "text-black/50 dark:text-white/50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
