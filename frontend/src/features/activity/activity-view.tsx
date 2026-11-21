"use client";

import { History } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Pagination } from "@/components/ui/pagination";
import { Panel } from "@/components/ui/panel";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { StatusDot } from "@/components/ui/status-badge";
import { useClients } from "@/features/clients/api";
import { SearchInput } from "@/features/contents/content-filters";
import { cn } from "@/lib/cn";
import { formatDateTime, formatLongDate, formatRelative } from "@/lib/format";
import { CONTENT_STATUSES, type ContentStatus, STATUS_LABELS } from "@/lib/labels";
import { useUrlState } from "@/lib/use-url-state";
import { type StatusEvent, useActivity } from "./api";
import { actorName, EventTransition } from "./event-transition";

const PAGE_SIZE = 20;

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" });

function dayLabel(iso: string) {
  const day = dayKey.format(new Date(iso));
  const today = dayKey.format(new Date());
  const yesterday = dayKey.format(new Date(Date.now() - 86_400_000));
  if (day === today) return "Bugün";
  if (day === yesterday) return "Dün";
  return formatLongDate(iso);
}

function groupByDay(events: StatusEvent[]) {
  const groups: Array<{ label: string; events: StatusEvent[] }> = [];
  for (const event of events) {
    const label = dayLabel(event.createdAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.events.push(event);
    else groups.push({ label, events: [event] });
  }
  return groups;
}

export function ActivityView() {
  const url = useUrlState();
  const clientId = url.get("clientId");
  const statusParam = url.get("status");
  const status = CONTENT_STATUSES.includes(statusParam as ContentStatus) ? (statusParam as ContentStatus) : undefined;
  const q = url.get("q");
  const page = Math.max(1, Number(url.get("page")) || 1);
  const setQuery = useCallback((value?: string) => url.set({ q: value, page: null }), [url]);

  const clients = useClients();
  const activity = useActivity({ clientId, status, q, page, pageSize: PAGE_SIZE });

  return (
    <>
      <PageHeader
        eyebrow={activity.data ? `${activity.data.meta.total} durum değişikliği` : " "}
        title="Hareketler"
        actions={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-2.5">
            <SearchInput value={q} onChange={setQuery} />
            <select
              aria-label="Müşteri"
              value={clientId ?? ""}
              onChange={(event) => url.set({ clientId: event.target.value || null, page: null })}
              className="h-9.5 rounded-full border border-line bg-surface px-3.5 pr-8 text-[13px] font-semibold text-ink-soft max-sm:col-span-2 max-sm:w-full"
            >
              <option value="">Tüm müşteriler</option>
              {clients.data?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div role="tablist" aria-label="Yeni durum" className="flex gap-1 overflow-x-auto rounded-full bg-sunken p-1 sm:w-fit">
        {[undefined, ...CONTENT_STATUSES].map((value) => (
          <button
            key={value ?? "all"}
            type="button"
            role="tab"
            aria-selected={status === value}
            onClick={() => url.set({ status: value ?? null, page: null })}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold",
              status === value ? "bg-surface text-ink shadow-sm" : "text-muted",
            )}
          >
            {value && <StatusDot status={value} className="size-2" />}
            {value ? `${STATUS_LABELS[value]} durumuna` : "Tümü"}
          </button>
        ))}
      </div>

      <Panel>
        {activity.isPending ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((key) => (
              <Skeleton key={key} className="h-14" />
            ))}
          </div>
        ) : activity.isError ? (
          <ErrorState message={activity.error.message} onRetry={() => activity.refetch()} />
        ) : activity.data.data.length === 0 ? (
          <EmptyState
            icon={<History className="size-5" />}
            title="Hareket bulunamadı"
            description={
              q ? `"${q}" başlığıyla eşleşen bir durum değişikliği yok.` : "Bu filtrelere uygun bir durum değişikliği yok."
            }
          />
        ) : (
          <>
            {groupByDay(activity.data.data).map((group) => (
              <section key={group.label} className="mb-4 last:mb-0">
                <h2 className="mb-1 text-xs font-extrabold tracking-[0.08em] text-subtle uppercase">{group.label}</h2>
                <ul className="divide-y divide-line-soft">
                  {group.events.map((event) => (
                    <li key={event.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar name={event.client.name} size={34} />
                        <div className="min-w-0">
                          <Link
                            href={`/contents?edit=${event.content.id}`}
                            className="block truncate text-sm font-bold hover:underline"
                          >
                            {event.content.title}
                          </Link>
                          <p className="truncate text-xs text-muted">
                            {event.client.name} · {actorName(event)} ·{" "}
                            <time dateTime={event.createdAt} title={formatDateTime(event.createdAt)}>
                              {formatRelative(event.createdAt)}
                            </time>
                          </p>
                        </div>
                      </div>
                      <div className="max-sm:pl-11.5">
                        <EventTransition event={event} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={activity.data.meta.total}
              label="hareket"
              onChange={(next) => url.set({ page: next > 1 ? String(next) : null })}
            />
          </>
        )}
      </Panel>
    </>
  );
}
