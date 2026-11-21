"use client";

import { History } from "lucide-react";
import { Skeleton } from "@/components/ui/states";
import { useContentHistory } from "@/features/activity/api";
import { actorName, EventTransition } from "@/features/activity/event-transition";
import { formatDateTime, formatRelative } from "@/lib/format";

export function ContentHistory({ contentId }: { contentId: string }) {
  const history = useContentHistory(contentId);

  return (
    <section aria-labelledby="content-history" className="mt-8 border-t border-line-soft pt-5">
      <h3 id="content-history" className="mb-3 flex items-center gap-2 text-sm font-extrabold">
        <History className="size-4 text-muted" />
        Geçmiş
      </h3>
      {history.isPending ? (
        <Skeleton className="h-24" />
      ) : history.isError ? (
        <p className="text-sm text-muted">Geçmiş yüklenemedi.</p>
      ) : (
        <ol className="relative flex flex-col gap-4 border-l border-line pl-5">
          {history.data.map((event) => (
            <li key={event.id} className="relative">
              <span aria-hidden className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-surface bg-subtle" />
              <EventTransition event={event} />
              <p className="mt-1 text-xs text-muted">
                {actorName(event)} ·{" "}
                <time dateTime={event.createdAt} title={formatDateTime(event.createdAt)}>
                  {formatRelative(event.createdAt)}
                </time>
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
