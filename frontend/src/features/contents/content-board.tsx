"use client";

import {
  type Announcements,
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardCode,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CalendarDays, ChevronDown, CircleAlert, GripVertical, Plus } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { TypeBadge } from "@/components/ui/type-icon";
import { cn } from "@/lib/cn";
import { formatDueDate } from "@/lib/format";
import { CONTENT_STATUSES, type ContentStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/labels";
import { canTransition, INITIAL_STATUSES, isLocked } from "@/lib/transitions";
import { useUpdateContentStatus } from "./api";
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

type CardActions = Pick<BoardProps, "onEdit" | "onDelete">;

function CardView({
  content,
  onEdit,
  onDelete,
  handle,
}: { content: Content; handle?: ReactNode } & Partial<CardActions>) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1">
          {handle}
          <TypeBadge type={content.type} />
        </span>
        <span className="flex items-center gap-0.5">
          {content.link && <ContentLink href={content.link} />}
          {onEdit && onDelete && (
            <ContentMenu content={content} onEdit={() => onEdit(content)} onDelete={() => onDelete(content)} />
          )}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onEdit?.(content)}
        className="mt-2.5 block text-left text-[15px] font-bold hover:underline"
      >
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
    </>
  );
}

const cardClass = "rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(28,25,23,0.06)]";

function BoardCard({ content, onEdit, onDelete }: { content: Content } & CardActions) {
  const locked = isLocked(content.status);
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: content.id,
    data: { content },
    disabled: locked,
  });

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      className={cn(cardClass, isDragging && "opacity-40")}
    >
      <CardView
        content={content}
        onEdit={onEdit}
        onDelete={onDelete}
        handle={
          !locked && (
            <button
              ref={setActivatorNodeRef}
              type="button"
              aria-label={`Taşı: ${content.title}`}
              className="-ml-1.5 grid size-7 shrink-0 cursor-move place-items-center rounded-md text-subtle hover:bg-sunken hover:text-ink max-lg:hidden"
              {...attributes}
            >
              <GripVertical className="size-4" />
            </button>
          )
        }
      />
    </article>
  );
}

function BoardColumn({
  status,
  items,
  hiddenOnMobile,
  dragging,
  onEdit,
  onDelete,
  onCreate,
}: {
  status: ContentStatus;
  items: Content[];
  hiddenOnMobile: boolean;
  dragging: Content | null;
} & Omit<BoardProps, "contents">) {
  const [visible, setVisible] = useState(PAGE);
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const remaining = items.length - visible;
  const isSource = dragging?.status === status;
  const accepts = dragging ? canTransition(dragging.status, status) : false;

  return (
    <section
      ref={setNodeRef}
      aria-label={STATUS_LABELS[status]}
      className={cn(
        "flex min-w-0 flex-col gap-2.5 rounded-panel p-3.5 outline-2 outline-offset-2 outline-transparent transition-[outline-color,opacity]",
        STATUS_STYLES[status].panel,
        hiddenOnMobile && "max-lg:hidden",
        dragging && accepts && "outline-dashed outline-ink/25",
        accepts && isOver && "outline-solid outline-ink/60",
        dragging && !accepts && !isSource && "opacity-50",
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
          {accepts ? "Buraya bırakın." : "Bu durumda içerik yok."}
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
      {INITIAL_STATUSES.includes(status) && (
        <button
          type="button"
          onClick={() => onCreate(status)}
          className="flex h-11 items-center justify-center gap-2 rounded-card border border-dashed border-ink/15 text-[13px] font-semibold text-muted hover:bg-surface/60 hover:text-ink"
        >
          <Plus className="size-4" />
          {STATUS_LABELS[status]} ekle
        </button>
      )}
    </section>
  );
}

const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : rectIntersection(args);
};

const columnKeyboardCoordinates: KeyboardCoordinateGetter = (event, { currentCoordinates, context }) => {
  const { collisionRect, droppableRects } = context;
  if (!collisionRect) return undefined;
  const step = event.code === KeyboardCode.Right ? 1 : event.code === KeyboardCode.Left ? -1 : 0;
  if (step === 0) {
    if (event.code === KeyboardCode.Up || event.code === KeyboardCode.Down) event.preventDefault();
    return undefined;
  }
  event.preventDefault();
  const columns = CONTENT_STATUSES.map((status) => droppableRects.get(status)).filter(
    (rect): rect is NonNullable<typeof rect> => Boolean(rect?.width),
  );
  const center = collisionRect.left + collisionRect.width / 2;
  const current = columns.findIndex((rect) => center >= rect.left && center <= rect.right);
  const target = columns[current + step];
  if (!target) return undefined;
  return { x: currentCoordinates.x + (target.left + 14 - collisionRect.left), y: currentCoordinates.y };
};

const titleOf = (data: unknown) => (data as { content?: Content } | undefined)?.content?.title ?? "İçerik";

const announcements: Announcements = {
  onDragStart: ({ active }) => `"${titleOf(active.data.current)}" taşınmak üzere alındı.`,
  onDragOver: ({ active, over }) => {
    if (!over) return "Bir sütunun üzerinde değil.";
    const content = (active.data.current as { content: Content }).content;
    const status = over.id as ContentStatus;
    if (status === content.status) return `${STATUS_LABELS[status]} sütununda, mevcut durum.`;
    return canTransition(content.status, status)
      ? `${STATUS_LABELS[status]} sütunu üzerinde.`
      : `${STATUS_LABELS[status]} sütunu üzerinde. Bu duruma taşınamaz.`;
  },
  onDragEnd: ({ active, over }) => {
    const content = (active.data.current as { content: Content }).content;
    const status = over?.id as ContentStatus | undefined;
    return status && canTransition(content.status, status)
      ? `"${content.title}" ${STATUS_LABELS[status]} durumuna bırakıldı.`
      : "Bırakıldı, durum değişmedi.";
  },
  onDragCancel: () => "Taşıma iptal edildi.",
};

const screenReaderInstructions = {
  draggable:
    "Taşımak için boşluk tuşuna basın. Sol ve sağ ok tuşlarıyla sütun değiştirin, bırakmak için tekrar boşluk tuşuna, iptal etmek için Escape tuşuna basın.",
};

export function ContentBoard({ contents, onEdit, onDelete, onCreate }: BoardProps) {
  const [mobileStatus, setMobileStatus] = useState<ContentStatus>("in_review");
  const [dragging, setDragging] = useState<Content | null>(null);
  const updateStatus = useUpdateContentStatus();
  const notify = useToast();
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnKeyboardCoordinates }),
  );
  const grouped = Object.fromEntries(
    CONTENT_STATUSES.map((status) => [status, contents.filter((content) => content.status === status)]),
  ) as Record<ContentStatus, Content[]>;

  useEffect(() => {
    if (!dragging) return;
    const root = document.documentElement;
    root.classList.add("is-dragging");
    return () => root.classList.remove("is-dragging");
  }, [dragging]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDragging((active.data.current as { content: Content }).content);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);
    const content = (active.data.current as { content: Content }).content;
    const status = over?.id as ContentStatus | undefined;
    if (!status || status === content.status) return;
    if (!canTransition(content.status, status)) {
      notify(`${STATUS_LABELS[content.status]} içerik ${STATUS_LABELS[status]} durumuna taşınamaz.`, "info");
      return;
    }
    updateStatus.mutate({ id: content.id, status });
  };

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
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        accessibility={{ announcements, screenReaderInstructions }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDragging(null)}
      >
        <div className="grid items-start gap-4 lg:grid-cols-3">
          {CONTENT_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              items={grouped[status]}
              hiddenOnMobile={mobileStatus !== status}
              dragging={dragging}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreate={onCreate}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {dragging && (
            <article className={cn(cardClass, "rotate-1 shadow-lg")}>
              <CardView content={dragging} />
            </article>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
