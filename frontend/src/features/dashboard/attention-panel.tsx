import { ArrowRight, CircleCheck } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";
import { OverdueBadge, StatusBadge } from "@/components/ui/status-badge";
import type { Content } from "@/features/contents/types";
import { formatDueDate } from "@/lib/format";
import { TYPE_LABELS } from "@/lib/labels";

export function AttentionPanel({ items }: { items: Content[] }) {
  return (
    <Panel>
      <PanelHeader
        title={
          <span className="flex items-center gap-2">
            Dikkat gerektirenler
            {items.length > 0 && (
              <span className="rounded-full bg-danger-bg px-2 py-0.5 text-xs font-bold text-danger">{items.length}</span>
            )}
          </span>
        }
        action={
          <Link href="/contents" className="flex items-center gap-1 text-[13px] font-bold">
            Panoya git <ArrowRight className="size-4" />
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<CircleCheck className="size-5 text-published" />}
          title="Her şey yolunda"
          description="Geciken ya da önümüzdeki iki gün içinde teslim edilecek içerik yok."
        />
      ) : (
        <ul className="divide-y divide-line-soft">
          {items.map((content) => (
            <li key={content.id}>
              <Link href={`/contents?edit=${content.id}`} className="flex items-center gap-3.5 py-3 hover:opacity-80">
                <Avatar name={content.client.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{content.title}</p>
                  <p className="truncate text-xs text-muted">
                    {content.client.name} · {TYPE_LABELS[content.type]}
                    {content.dueDate && !content.isOverdue && ` · ${formatDueDate(content.dueDate)} teslim`}
                  </p>
                </div>
                {content.isOverdue ? <OverdueBadge /> : <StatusBadge status={content.status} />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
