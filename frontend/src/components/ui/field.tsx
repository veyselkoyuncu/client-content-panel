import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-xl border bg-surface px-3.5 text-sm text-ink placeholder:text-subtle transition-colors outline-none focus:border-ink disabled:opacity-60";

interface FieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; className: string }) => ReactNode;
}

export function Field({ label, error, hint, required, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-bold text-ink-soft">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error || hint ? messageId : undefined,
        className: cn(control, error ? "border-danger" : "border-line"),
      })}
      {error ? (
        <p id={messageId} className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const Input = ({ className, ...props }: ComponentProps<"input">) => (
  <input className={cn("h-11", className)} {...props} />
);

export const Textarea = ({ className, ...props }: ComponentProps<"textarea">) => (
  <textarea className={cn("min-h-28 py-3", className)} {...props} />
);

export const Select = ({ className, ...props }: ComponentProps<"select">) => (
  <select className={cn("h-11 pr-8", className)} {...props} />
);
