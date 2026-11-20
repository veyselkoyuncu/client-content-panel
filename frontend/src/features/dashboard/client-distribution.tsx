import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";
import { StatusDot } from "@/components/ui/status-badge";
import type { Client } from "@/features/clients/api";
import { CONTENT_STATUSES, STATUS_LABELS, STATUS_STYLES } from "@/lib/labels";

const MAX_CLIENTS = 6;

function DistributionBar({ client }: { client: Client }) {
  const segments = [
    { status: "draft", count: client.draftCount },
    { status: "in_review", count: client.inReviewCount },
    { status: "published", count: client.publishedCount },
  ] as const;

  if (client.contentCount === 0) {
    return <div className="h-2.5 flex-1 rounded-full bg-sunken" />;
  }
  return (
    <div
      className="flex h-2.5 flex-1 gap-0.75 overflow-hidden rounded-full"
      role="img"
      aria-label={segments.map((s) => `${STATUS_LABELS[s.status]} ${s.count}`).join(", ")}
    >
      {segments
        .filter((segment) => segment.count > 0)
        .map((segment) => (
          <span key={segment.status} className={STATUS_STYLES[segment.status].dot} style={{ flexGrow: segment.count }} />
        ))}
    </div>
  );
}

export function ClientDistribution({ clients }: { clients: Client[] }) {
  const top = [...clients].sort((a, b) => b.contentCount - a.contentCount).slice(0, MAX_CLIENTS);

  return (
    <Panel>
      <PanelHeader
        title="Müşteriler"
        action={
          <Link href="/clients?new=1" className="flex items-center gap-1 text-[13px] font-bold">
            <Plus className="size-4" /> Ekle
          </Link>
        }
      />
      {top.length === 0 ? (
        <EmptyState
          icon={<Users className="size-5" />}
          title="Henüz müşteri yok"
          description="İçerik takibine başlamak için ilk müşterini ekle."
          action={<ButtonLink href="/clients?new=1" size="sm">Müşteri ekle</ButtonLink>}
        />
      ) : (
        <>
          <div className="mb-2 flex gap-4 text-xs font-semibold text-muted">
            {CONTENT_STATUSES.map((status) => (
              <span key={status} className="flex items-center gap-1.5">
                <StatusDot status={status} className="size-2" /> {STATUS_LABELS[status]}
              </span>
            ))}
          </div>
          <ul>
            {top.map((client) => (
              <li key={client.id}>
                <Link href={`/clients/${client.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                  <Avatar name={client.name} size={34} />
                  <div className="w-28 min-w-0 sm:w-40">
                    <p className="truncate text-sm font-bold">{client.name}</p>
                    {client.industry && <p className="truncate text-xs text-muted">{client.industry}</p>}
                  </div>
                  <DistributionBar client={client} />
                  <span className="w-16 shrink-0 text-right text-xs font-semibold text-muted">
                    {client.contentCount} içerik
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {clients.length > MAX_CLIENTS && (
            <Link href="/clients" className="mt-2 block text-[13px] font-bold">
              Tüm müşteriler ({clients.length})
            </Link>
          )}
        </>
      )}
    </Panel>
  );
}
