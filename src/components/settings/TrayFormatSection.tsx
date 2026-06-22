import type { TraySettings } from "@/types";
import { ToggleRow, Segmented } from "./Controls";

interface TrayFormatSectionProps {
  value: TraySettings;
  onChange: (next: TraySettings) => void;
}

/** Controls how the menu bar (tray) title is composed. */
export function TrayFormatSection({ value, onChange }: TrayFormatSectionProps) {
  const set = <K extends keyof TraySettings>(key: K, next: TraySettings[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <section className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-black/50 dark:text-white/50">
        메뉴바 표시
      </span>

      <ToggleRow
        label="이모지 표시"
        enabled={value.showEmoji}
        onChange={(v) => set("showEmoji", v)}
      />

      <ToggleRow
        label="남은 시간 표시"
        enabled={value.showTime}
        onChange={(v) => set("showTime", v)}
      />

      {value.showTime && (
        <div className="pl-1">
          <Segmented
            value={value.timeFormat}
            onChange={(v) => set("timeFormat", v)}
            options={[
              { id: "compact", label: "2h 13m" },
              { id: "hm", label: "2:13" },
              { id: "hms", label: "2:13:22" },
            ]}
          />
        </div>
      )}

      <ToggleRow
        label="진행률(%) 표시"
        enabled={value.showPercent}
        onChange={(v) => set("showPercent", v)}
      />
    </section>
  );
}
