import type { ManualConfig } from "@/types";
import { Field, TextInput } from "./Field";
import { Segmented } from "./Controls";

interface ManualFormProps {
  value: ManualConfig;
  onChange: (next: ManualConfig) => void;
}

/** Editor for the usual schedule: clock-in plus duration or fixed clock-out. */
export function ManualForm({ value, onChange }: ManualFormProps) {
  const set = <K extends keyof ManualConfig>(key: K, next: ManualConfig[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="flex flex-col gap-2">
      <Field label="출근 시간">
        <TextInput
          type="time"
          value={value.clockIn}
          onChange={(e) => set("clockIn", e.target.value)}
        />
      </Field>

      <Segmented
        value={value.mode}
        onChange={(m) => set("mode", m)}
        options={[
          { id: "duration", label: "근무 시간으로" },
          { id: "fixed", label: "퇴근 시간 지정" },
        ]}
      />

      {value.mode === "duration" ? (
        <Field label="근무 시간 (시간)">
          <TextInput
            type="number"
            min={1}
            max={24}
            step={0.5}
            value={value.workMinutes / 60}
            onChange={(e) =>
              set("workMinutes", Math.round(Number(e.target.value) * 60))
            }
          />
        </Field>
      ) : (
        <Field label="퇴근 시간">
          <TextInput
            type="time"
            value={value.clockOut}
            onChange={(e) => set("clockOut", e.target.value)}
          />
        </Field>
      )}
    </div>
  );
}
