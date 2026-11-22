"use client";

import { CalendarDays, Check } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { StatusDot } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";
import { CONTENT_STATUSES, type ContentStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/labels";

type Phase = "draft" | "to-review" | "review" | "to-published" | "published" | "done";

const TIMELINE: Array<[Phase, number]> = [
  ["to-review", 900],
  ["review", 1650],
  ["to-published", 2500],
  ["published", 3250],
  ["done", 4300],
];
const ENTRANCE_MS = 700;
const CYCLE_MS = 6800;

const TRAVELERS = [
  "Bahar koleksiyonu duyurusu",
  "Yeni şube açılış gönderisi",
  "Sık sorulan sorular sayfası",
  "Bayram kampanya görseli",
];
const ROWS: Record<ContentStatus, { title: string; count: number; meta: string }> = {
  draft: { title: "Filtre kahve demleme rehberi", count: 9, meta: "27 Kas" },
  in_review: { title: "Kış menüsü lansmanı", count: 8, meta: "Yarın" },
  published: { title: "İmplant hizmet sayfası", count: 12, meta: "Bugün" },
};

const SLOT_OF: Record<Phase, ContentStatus> = {
  draft: "draft",
  "to-review": "in_review",
  review: "in_review",
  "to-published": "published",
  published: "published",
  done: "published",
};

const at = (phase: Phase, from: Phase) =>
  TIMELINE.findIndex(([p]) => p === phase) >= TIMELINE.findIndex(([p]) => p === from);

interface Slot {
  x: number;
  y: number;
  width: number;
}

function measureSlot(node: HTMLElement, container: HTMLElement): Slot {
  let x = 0;
  let y = 0;
  let current: HTMLElement | null = node;
  while (current && current !== container) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return { x, y, width: node.offsetWidth };
}

function CheckBadge({ animate }: { animate?: boolean }) {
  return (
    <span
      className={cn(
        "absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-published text-white shadow-sm",
        animate && "motion-safe:animate-pop",
      )}
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}

export function FlowPreview() {
  const [phase, setPhase] = useState<Phase>("draft");
  const [slots, setSlots] = useState<Partial<Record<ContentStatus, Slot>>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Partial<Record<ContentStatus, HTMLDivElement | null>>>({});
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: number[] = [];
    const cycle = (delay: number) => {
      timers.length = 0;
      for (const [next, offset] of TIMELINE) {
        timers.push(window.setTimeout(() => setPhase(next), delay + offset));
      }
      timers.push(
        window.setTimeout(() => {
          setRound((value) => value + 1);
          setPhase("draft");
          cycle(0);
        }, delay + CYCLE_MS),
      );
    };
    cycle(ENTRANCE_MS);
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () =>
      setSlots(
        Object.fromEntries(
          CONTENT_STATUSES.map((status) => {
            const node = slotRefs.current[status];
            return [status, node ? measureSlot(node, container) : undefined];
          }),
        ),
      );
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const target = slots[SLOT_OF[phase]];
  const moving = phase === "to-review" || phase === "to-published";
  const travelerVisible = Boolean(target) && phase !== "done";
  const traveler = TRAVELERS[round % TRAVELERS.length];
  const previous = round > 0 ? TRAVELERS[(round - 1) % TRAVELERS.length] : null;

  const rowState = (status: ContentStatus) => {
    const row = ROWS[status];
    switch (status) {
      case "draft":
        return phase === "draft"
          ? {
              title: traveler,
              count: row.count + 1,
              covered: travelerVisible,
              active: false,
            }
          : {
              title: row.title,
              count: row.count,
              covered: false,
              active: false,
            };
      case "in_review": {
        const here = phase === "review";
        return {
          title: row.title,
          count: row.count + (here ? 1 : 0),
          covered: here && travelerVisible,
          active: here,
        };
      }
      default: {
        const arrived = at(phase, "published");
        return {
          title: phase === "done" ? traveler : (previous ?? row.title),
          count: row.count + round + (arrived ? 1 : 0),
          covered: phase === "published" && travelerVisible,
          active: phase === "published",
        };
      }
    }
  };

  return (
    <div ref={containerRef} aria-hidden className="relative flex flex-col gap-2.5">
      {CONTENT_STATUSES.map((status, index) => {
        const row = rowState(status);
        return (
          <div
            key={status}
            className={cn(
              "flex items-center gap-4 rounded-card p-4 shadow-[0_1px_2px_rgba(28,25,23,0.06)] ring-2 ring-transparent transition-shadow duration-300 motion-safe:animate-rise",
              STATUS_STYLES[status].panel,
              row.active && (status === "published" ? "ring-published/40" : "ring-review/40"),
            )}
            style={{
              marginLeft: index * 28,
              marginRight: (CONTENT_STATUSES.length - 1 - index) * 28,
              animationDelay: `${index * 120}ms`,
            }}
          >
            <span
              key={row.count}
              className="w-14 text-[32px] leading-none font-extrabold tracking-tighter tabular-nums motion-safe:animate-tick"
            >
              {row.count}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold">
                <StatusDot status={status} className="size-2" />
                {STATUS_LABELS[status]}
              </p>
              <div
                ref={(node) => {
                  slotRefs.current[status] = node;
                }}
                className={cn("relative mt-1", row.covered && "invisible")}
              >
                <p
                  key={row.title}
                  className={cn(
                    "truncate rounded-lg bg-surface px-2.5 py-1.5 text-[13px] font-semibold",
                    status === "draft" && "motion-safe:animate-chip-in",
                  )}
                >
                  {row.title}
                </p>
                {status === "published" && phase === "done" && <CheckBadge />}
              </div>
            </div>
            <span className="flex w-16 shrink-0 items-center justify-end gap-1 text-xs text-muted">
              <CalendarDays className="size-3.5" />
              {ROWS[status].meta}
            </span>
          </div>
        );
      })}

      {travelerVisible && target && (
        <div
          className="absolute top-0 left-0 transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{
            width: target.width,
            transform: `translate(${target.x}px, ${target.y}px)`,
          }}
        >
          <div className="relative motion-safe:animate-rise">
            <p
              className={cn(
                "truncate rounded-lg bg-surface px-2.5 py-1.5 text-[13px] font-semibold transition-[scale,box-shadow] duration-300",
                moving ? "scale-[1.04] shadow-lg" : "shadow-none",
              )}
            >
              {traveler}
            </p>
            {phase === "published" && <CheckBadge animate />}
          </div>
        </div>
      )}
    </div>
  );
}
