import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusEvent } from "./api";

export function EventTransition({ event }: { event: StatusEvent }) {
  if (!event.fromStatus) {
    return (
      <span className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
        Oluşturuldu <StatusBadge status={event.toStatus} />
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <StatusBadge status={event.fromStatus} />
      <ArrowRight aria-label="durumundan" className="size-3.5 text-subtle" />
      <StatusBadge status={event.toStatus} />
    </span>
  );
}

export const actorName = (event: StatusEvent) => event.user?.name ?? "Sistem";
