/** Small labelled-input primitives shared by onboarding and settings. */

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-black/50 dark:text-white/50">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[10px] text-black/35 dark:text-white/35">
          {hint}
        </span>
      )}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "rounded-lg border border-black/10 bg-white/60 px-3 py-1.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 dark:border-white/10 dark:bg-white/5 " +
        (props.className ?? "")
      }
    />
  );
}
