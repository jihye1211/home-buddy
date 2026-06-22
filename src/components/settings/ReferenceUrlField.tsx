import { openUrl } from "@/services/opener";
import { IconExternal } from "@/components/ui/icons";
import { Field, TextInput } from "./Field";

interface ReferenceUrlFieldProps {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  hint?: string;
}

/** Reference-URL input with an inline "열기" shortcut to open the saved page. */
export function ReferenceUrlField({
  value,
  onChange,
  label = "근태 확인 URL",
  hint = "출근일시를 확인하는 페이지. 이 기기에만 저장돼요.",
}: ReferenceUrlFieldProps) {
  const hasUrl = value.trim().length > 0;

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-1.5">
        <TextInput
          type="text"
          placeholder="https://"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <button
          type="button"
          disabled={!hasUrl}
          onClick={() => void openUrl(value)}
          aria-label="URL 열기"
          className="flex shrink-0 items-center gap-1 rounded-lg border border-sky-400/60 bg-sky-500/10 px-2.5 text-xs font-medium text-sky-600 transition hover:bg-sky-500/15 active:scale-95 disabled:opacity-40 dark:text-sky-300"
        >
          <IconExternal size={12} />
        </button>
      </div>
    </Field>
  );
}
