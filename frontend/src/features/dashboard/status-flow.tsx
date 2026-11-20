import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/ui/status-badge";
import type { Content } from "@/features/contents/types";
import { cn } from "@/lib/cn";
import { formatDueDate } from "@/lib/format";
import { CONTENT_STATUSES, type ContentStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/labels";
import type { DashboardSummary } from "./api";

const LABEL_TONE: Record<ContentStatus, string> = {
  draft: "text-ink",
  in_review: "text-review-fg",
  published: "text-published-fg",
};

function MiniContent({ content }: { content: Content }) {
  return (
    <Link
      href={`/contents?edit=${content.id}`}
      className="flex items-center gap-2.5 rounded-card bg-surface px-3.5 py-3 text-[13px] font-semibold transition-shadow hover:shadow-md"
    >
      <Avatar name={content.client.name} size={22} />
      <span className="truncate">{content.title}</span>
      <span className={cn("ml-auto shrink-0 text-xs font-medium", content.isOverdue ? "text-danger" : "text-muted")}>
        {content.isOverdue ? "Gecikti" : content.dueDate ? formatDueDate(content.dueDate) : ""}
      </span>
    </Link>
  );
}

function StageCard({ status, summary }: { status: ContentStatus; summary: DashboardSummary }) {
  const items = summary.latestByStatus[status];
  const note =
    status === "in_review" && summary.overdueCount > 0 ? `${summary.overdueCount} içerik gecikmede` : undefined;

  return (
    <div className={cn("flex min-h-59 min-w-0 flex-1 flex-col gap-4 rounded-panel p-5 sm:p-6", STATUS_STYLES[status].panel)}>
      <div className="flex items-center justify-between gap-2">
        <Link href={`/contents?status=${status}`} className={cn("flex items-center gap-2 text-[15px] font-bold hover:underline", LABEL_TONE[status])}>
          <StatusDot status={status} />
          {STATUS_LABELS[status]}
        </Link>
        {note && <span className="text-xs font-bold text-review-fg">{note}</span>}
      </div>
      <p className="text-[56px] leading-none font-extrabold tracking-tighter">{summary.contentsByStatus[status]}</p>
      <div className="mt-auto flex flex-col gap-2">
        {items.length > 0 ? (
          items.map((content) => <MiniContent key={content.id} content={content} />)
        ) : (
          <p className="rounded-card bg-surface/60 px-3.5 py-3 text-[13px] text-muted">Bu durumda içerik yok.</p>
        )}
      </div>
    </div>
  );
}

export function StatusFlow({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
      {CONTENT_STATUSES.map((status, index) => (
        <Fragment key={status}>
          {index > 0 && (
            <div aria-hidden className="hidden w-9 items-center justify-center text-subtle lg:flex">
              <ArrowRight className="size-5" />
            </div>
          )}
          <StageCard status={status} summary={summary} />
        </Fragment>
      ))}
    </div>
  );
}
