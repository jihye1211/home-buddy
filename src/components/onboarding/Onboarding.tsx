import { useState } from "react";
import { motion } from "framer-motion";
import type { Settings } from "@/types";
import { validateManualConfig } from "@/utils/schedule";
import { CharacterPicker } from "@/components/settings/CharacterPicker";
import { ManualForm } from "@/components/settings/ManualForm";
import { ReferenceUrlField } from "@/components/settings/ReferenceUrlField";

interface OnboardingProps {
  initial: Settings;
  onComplete: (settings: Settings) => void;
}

/** First-run setup. Collects the usual schedule, an optional check URL, and a buddy. */
export function Onboarding({ initial, onComplete }: OnboardingProps) {
  const [draft, setDraft] = useState<Settings>(initial);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    const err = validateManualConfig(draft.manual);
    if (err) return setError(err);
    onComplete({ ...draft, onboarded: true });
  };

  return (
    <motion.div
      className="glass-surface flex max-h-[620px] w-full flex-col gap-4 overflow-y-auto rounded-popover p-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="flex flex-col gap-1">
        <span className="text-2xl">{draft.character} 👋</span>
        <h1 className="text-base font-semibold text-black/85 dark:text-white/90">
          안녕하세요
        </h1>
        <p className="text-xs text-black/50 dark:text-white/50">
          오늘부터 함께 퇴근할게요. 평소 출퇴근 시간을 알려주세요.
        </p>
      </header>

      <ManualForm
        value={draft.manual}
        onChange={(manual) => setDraft((d) => ({ ...d, manual }))}
      />

      <ReferenceUrlField
        value={draft.referenceUrl}
        onChange={(referenceUrl) => setDraft((d) => ({ ...d, referenceUrl }))}
        label="근태 확인 URL (선택)"
        hint="출근일시를 확인하는 페이지 주소. 이 기기에만 저장돼요."
      />

      <CharacterPicker
        value={draft.character}
        onChange={(character) => setDraft((d) => ({ ...d, character }))}
      />

      {error && <p className="text-[11px] text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleStart}
        className="mt-1 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
      >
        다음 →
      </button>
    </motion.div>
  );
}
