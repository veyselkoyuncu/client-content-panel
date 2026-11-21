import { Avatar } from "@/components/ui/avatar";
import { OverdueBadge, StatusBadge } from "@/components/ui/status-badge";
import { TypeBadge, TypeIconBox } from "@/components/ui/type-icon";
import { cn } from "@/lib/cn";
import { formatDueDate } from "@/lib/format";
import { CONTENT_STATUSES, type ContentStatus, STATUS_LABELS, TYPE_LABELS } from "@/lib/labels";
import { ContentLink } from "./content-link";
import { ContentMenu } from "./content-menu";
import type { Content, StatusCounts } from "./types";

interface StatusTabsProps {
  value?: ContentStatus;
  counts?: StatusCounts;
  onChange: (status?: ContentStatus) => void;
}

export function StatusTabs({ value, counts, onChange }: StatusTabsProps) {
  const total = counts ? counts.draft + counts.in_review + counts.published : undefined;
  const tabs: Array<{ key?: ContentStatus; label: string; count?: number }> = [
    { label: "Tümü", count: total },
    ...CONTENT_STATUSES.map((status) => ({ key: status, label: STATUS_LABELS[status], count: counts?.[status] })),
  ];
  return (
    <div role="tablist" aria-label="Durum filtresi" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line">
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-bold whitespace-nowrap",
              active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined && <span className="rounded-full bg-sunken px-2 text-xs">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

interface ListProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
}

export function ContentList({ contents, onEdit, onDelete }: ListProps) {
  return (
    <ul className="divide-y divide-line-soft">
      {contents.map((content) => (
        <li
          key={content.id}
          className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3.5 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_8rem_6.5rem_2rem]"
        >
          <div className="flex min-w-0 items-center gap-1">
            <button type="button" onClick={() => onEdit(content)} className="flex min-w-0 items-center gap-3 text-left">
              <TypeIconBox type={content.type} />
              <span className="truncate text-sm font-bold hover:underline">{content.title}</span>
            </button>
            {content.link && <ContentLink href={content.link} />}
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ContentMenu content={content} onEdit={() => onEdit(content)} onDelete={() => onDelete(content)} />
          </div>
          <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold max-md:col-span-2 max-md:pl-12">
            <Avatar name={content.client.name} size={22} />
            <span className="truncate">{content.client.name}</span>
            <span className="text-muted md:hidden">· {TYPE_LABELS[content.type]}</span>
          </span>
          <span className="hidden md:block">
            <TypeBadge type={content.type} />
          </span>
          <span className="flex gap-1.5 max-md:col-span-2 max-md:pl-12">
            <StatusBadge status={content.status} />
            {content.isOverdue && <span className="md:hidden"><OverdueBadge /></span>}
          </span>
          <span className={cn("hidden text-[13px] md:block", content.isOverdue ? "font-bold text-danger" : "text-muted")}>
            {content.dueDate ? formatDueDate(content.dueDate) : "—"}
          </span>
          <div className="hidden md:block">
            <ContentMenu content={content} onEdit={() => onEdit(content)} onDelete={() => onDelete(content)} />
          </div>
        </li>
      ))}
    </ul>
  );
}
