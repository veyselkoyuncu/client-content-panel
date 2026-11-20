import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("min-w-0 rounded-panel border border-line-soft bg-surface p-5 sm:p-6", className)} {...props} />;
}

export function PanelHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
