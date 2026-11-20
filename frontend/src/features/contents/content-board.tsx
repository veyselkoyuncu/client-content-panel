import { CalendarDays, CircleAlert, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/ui/status-badge";
import { TypeIcon } from "@/components/ui/type-icon";
import { cn } from "@/lib/cn";
import { formatDueDate } from "@/lib/format";
import { CONTENT_STATUSES, type ContentStatus, STATUS_LABELS, STATUS_STYLES, TYPE_LABELS } from "@/lib/labels";
import { ContentMenu } from "./content-menu";
import type { Content } from "./types";

const LABEL_TONE: Record<ContentStatus, string> = {
  draft: "text-ink",
  in_review: "text-review-fg",
  published: "text-published-fg",
};

interface BoardProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
  onCreate: (status: ContentStatus) => void;
}

function BoardCard({ content, onEdit, onDelete }: { content: Content } & Pick<BoardProps, "onEdit" | "onDelete">) {
  return (
    <article className="rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <TypeIcon type={content.type} className="size-3.5" />
          {TYPE_LABELS[content.type]}
        </span>
        <ContentMenu content={content} onEdit={() => onEdit(content)} onDelete={() => onDelete(content)} />
      </div>
      <button type="button" onClick={() => onEdit(content)} className="mt-1.5 block text-left text-[15px] font-bold hover:underline">
        {content.title}
      </button>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold">
          <Avatar name={content.client.name} size={22} />
          <span className="truncate">{content.client.name}</span>
        </span>
        {content.dueDate && (
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 text-xs font-semibold",
              content.isOverdue ? "text-danger" : "text-muted",
            )}
          >
            {content.isOverdue ? <CircleAlert className="size-3.5" /> : <CalendarDays className="size-3.5" />}
            {formatDueDate(content.dueDate)}
            {content.isOverdue && " · Gecikti"}
          </span>
        )}
      </div>
    </article>
  );
}

export function ContentBoard({ contents, onEdit, onDelete, onCreate }: BoardProps) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      {CONTENT_STATUSES.map((status) => {
        const items = contents.filter((content) => content.status === status);
        return (
          <section
            key={status}
            aria-label={STATUS_LABELS[status]}
            className={cn("flex min-w-0 flex-col gap-2.5 rounded-panel p-3.5", STATUS_STYLES[status].panel)}
          >
            <div className="flex items-center justify-between px-1.5 pt-1.5 pb-1">
              <h2 className={cn("flex items-center gap-2 text-[15px] font-bold", LABEL_TONE[status])}>
                <StatusDot status={status} />
                {STATUS_LABELS[status]}
              </h2>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-[13px] font-bold">{items.length}</span>
            </div>
            {items.map((content) => (
              <BoardCard key={content.id} content={content} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {items.length === 0 && (
              <p className="rounded-card border border-dashed border-ink/15 px-4 py-6 text-center text-[13px] text-muted">
                Bu durumda içerik yok.
              </p>
            )}
            <button
              type="button"
              onClick={() => onCreate(status)}
              className="flex h-11 items-center justify-center gap-2 rounded-card border border-dashed border-ink/15 text-[13px] font-semibold text-muted hover:bg-surface/60 hover:text-ink"
            >
              <Plus className="size-4" />
              {STATUS_LABELS[status]} ekle
            </button>
          </section>
        );
      })}
    </div>
  );
}
