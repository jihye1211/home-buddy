import { CHARACTER_PRESETS } from "@/utils/character";

interface CharacterPickerProps {
  value: string;
  onChange: (next: string) => void;
}

/**
 * Emoji buddy picker. The selected preset is highlighted in the grid; a
 * compact inline field on the label row covers arbitrary emoji without adding
 * a separate preview row.
 */
export function CharacterPicker({ value, onChange }: CharacterPickerProps) {
  const isCustom = !CHARACTER_PRESETS.includes(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-black/50 dark:text-white/50">
          나의 퇴근 도우미
        </span>
        <input
          value={isCustom ? value : ""}
          onChange={(e) => onChange(e.target.value.slice(0, 4))}
          maxLength={4}
          placeholder="직접"
          aria-label="이모지 직접 입력"
          className={`h-6 w-14 rounded-md border bg-white/60 px-1 text-center text-sm outline-none transition placeholder:text-[10px] placeholder:text-black/30 focus:border-sky-400 dark:bg-white/5 dark:placeholder:text-white/30 ${
            isCustom
              ? "border-sky-400 ring-1 ring-sky-400/40"
              : "border-black/10 dark:border-white/10"
          }`}
        />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {CHARACTER_PRESETS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`flex h-7 items-center justify-center rounded-lg text-lg transition active:scale-90 ${
              value === emoji
                ? "bg-sky-500/15 ring-1 ring-sky-400"
                : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            aria-pressed={value === emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
