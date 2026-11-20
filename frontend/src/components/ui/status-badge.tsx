import { cn } from "@/lib/cn";
import { type ContentStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/labels";

export function StatusDot({ status, className }: { status: ContentStatus; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full", STATUS_STYLES[status].dot, className)} />;
}

export function StatusBadge({ status, className }: { status: ContentStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold whitespace-nowrap",
        STATUS_STYLES[status].badge,
        className,
      )}
    >
      <StatusDot status={status} className="size-1.5" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex h-6.5 items-center rounded-full bg-danger-bg px-2.5 text-xs font-bold text-danger">
      Gecikti
    </span>
  );
}
