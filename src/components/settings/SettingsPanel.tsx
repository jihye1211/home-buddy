import { useState } from "react";
import { motion } from "framer-motion";
import type { Settings } from "@/types";
import { validateManualConfig } from "@/utils/schedule";
import { IconBack, IconCheck } from "@/components/ui/icons";
import { CharacterPicker } from "./CharacterPicker";
import { ManualForm } from "./ManualForm";
import { ReferenceUrlField } from "./ReferenceUrlField";
import { TrayFormatSection } from "./TrayFormatSection";
import { ToggleRow, Segmented } from "./Controls";

interface SettingsPanelProps {
  initial: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

/** Settings screen reachable from the popover's gear button. */
export function SettingsPanel({ initial, onSave, onClose }: SettingsPanelProps) {
  const [draft, setDraft] = useState<Settings>(initial);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const err = validateManualConfig(draft.manual);
    if (err) return setError(err);
    onSave(draft);
  };

  return (
    <motion.div
      className="glass-surface flex max-h-[660px] w-full flex-col gap-2.5 overflow-y-auto rounded-popover p-4"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <IconButton label="뒤로" onClick={onClose}>
            <IconBack />
          </IconButton>
          <h1 className="text-sm font-semibold text-black/85 dark:text-white/90">
            설정
          </h1>
        </div>
        <button
          type="button"
          aria-label="저장"
          onClick={handleSave}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm transition active:scale-90"
        >
          <IconCheck />
        </button>
      </header>

      {error && <p className="text-[11px] text-red-500">{error}</p>}

      <ManualForm
        value={draft.manual}
        onChange={(manual) => setDraft((d) => ({ ...d, manual }))}
      />

      <ReferenceUrlField
        value={draft.referenceUrl}
        onChange={(referenceUrl) => setDraft((d) => ({ ...d, referenceUrl }))}
        hint=""
      />

      <section className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-black/50 dark:text-white/50">
          매일 출근 시간{" "}
          <span className="font-normal text-black/35 dark:text-white/35">
            · 기본값 초기화 / 전날값 유지
          </span>
        </span>
        <Segmented
          value={draft.dailyReset}
          onChange={(dailyReset) => setDraft((d) => ({ ...d, dailyReset }))}
          options={[
            { id: "default", label: "기본값으로" },
            { id: "carry", label: "전날 값 유지" },
          ]}
        />
      </section>

      <CharacterPicker
        value={draft.character}
        onChange={(character) => setDraft((d) => ({ ...d, character }))}
      />

      <TrayFormatSection
        value={draft.tray}
        onChange={(tray) => setDraft((d) => ({ ...d, tray }))}
      />

      <ToggleRow
        label="야근 모드"
        hint="퇴근 시간이 지나면 초과근무를 표시해요"
        enabled={draft.overtimeEnabled}
        onChange={(overtimeEnabled) =>
          setDraft((d) => ({ ...d, overtimeEnabled }))
        }
      />
    </motion.div>
  );
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
      className="flex h-7 w-7 items-center justify-center rounded-lg text-black/55 transition hover:bg-black/5 hover:text-black/80 active:scale-90 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white/85"
    >
      {children}
    </button>
  );
}
