"use client";

import { CalendarDays, ChevronDown, CircleAlert, Plus } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/ui/status-badge";
import { TypeBadge } from "@/components/ui/type-icon";
import { cn } from "@/lib/cn";
import { formatDueDate } from "@/lib/format";
import { CONTENT_STATUSES, type ContentStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/labels";
import { ContentLink } from "./content-link";
import { ContentMenu } from "./content-menu";
import type { Content } from "./types";

const PAGE = 6;

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
        <TypeBadge type={content.type} />
        <span className="flex items-center gap-0.5">
          {content.link && <ContentLink href={content.link} />}
          <ContentMenu content={content} onEdit={() => onEdit(content)} onDelete={() => onDelete(content)} />
        </span>
      </div>
      <button type="button" onClick={() => onEdit(content)} className="mt-2.5 block text-left text-[15px] font-bold hover:underline">
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

function BoardColumn({
  status,
  items,
  hiddenOnMobile,
  onEdit,
  onDelete,
  onCreate,
}: { status: ContentStatus; items: Content[]; hiddenOnMobile: boolean } & Omit<BoardProps, "contents">) {
  const [visible, setVisible] = useState(PAGE);
  const remaining = items.length - visible;

  return (
    <section
      aria-label={STATUS_LABELS[status]}
      className={cn(
        "flex min-w-0 flex-col gap-2.5 rounded-panel p-3.5",
        STATUS_STYLES[status].panel,
        hiddenOnMobile && "max-lg:hidden",
      )}
    >
      <div className="flex items-center justify-between px-1.5 pt-1.5 pb-1 max-lg:hidden">
        <h2 className={cn("flex items-center gap-2 text-[15px] font-bold", LABEL_TONE[status])}>
          <StatusDot status={status} />
          {STATUS_LABELS[status]}
        </h2>
        <span className="rounded-full bg-surface px-2.5 py-0.5 text-[13px] font-bold">{items.length}</span>
      </div>
      {items.slice(0, visible).map((content) => (
        <BoardCard key={content.id} content={content} onEdit={onEdit} onDelete={onDelete} />
      ))}
      {items.length === 0 && (
        <p className="rounded-card border border-dashed border-ink/15 px-4 py-6 text-center text-[13px] text-muted">
          Bu durumda içerik yok.
        </p>
      )}
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setVisible((count) => count + PAGE)}
          className="flex h-11 items-center justify-center gap-1.5 rounded-card bg-surface/70 text-[13px] font-bold hover:bg-surface"
        >
          <ChevronDown className="size-4" />
          {remaining} içerik daha
        </button>
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
}

export function ContentBoard({ contents, onEdit, onDelete, onCreate }: BoardProps) {
  const [mobileStatus, setMobileStatus] = useState<ContentStatus>("in_review");
  const grouped = Object.fromEntries(
    CONTENT_STATUSES.map((status) => [status, contents.filter((content) => content.status === status)]),
  ) as Record<ContentStatus, Content[]>;

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Durum" className="grid grid-cols-3 gap-1 rounded-full bg-sunken p-1 lg:hidden">
        {CONTENT_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={mobileStatus === status}
            onClick={() => setMobileStatus(status)}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-full text-[13px] font-bold",
              mobileStatus === status ? "bg-surface text-ink shadow-sm" : "text-muted",
            )}
          >
            <StatusDot status={status} className="size-2" />
            {STATUS_LABELS[status]}
            <span className="text-xs text-muted">{grouped[status].length}</span>
          </button>
        ))}
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-3">
        {CONTENT_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            items={grouped[status]}
            hiddenOnMobile={mobileStatus !== status}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreate={onCreate}
          />
        ))}
      </div>
    </div>
  );
}
