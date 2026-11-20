"use client";

import { Columns3, FileText, List, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useClients } from "@/features/clients/api";
import { cn } from "@/lib/cn";
import { CONTENT_STATUSES, CONTENT_TYPES, type ContentStatus, type ContentType } from "@/lib/labels";
import { useUrlState } from "@/lib/use-url-state";
import { useContents } from "./api";
import { ContentBoard } from "./content-board";
import { ClientChips, SearchInput, TypeSelect } from "./content-filters";
import { ContentFormDrawer } from "./content-form";
import { ContentList, StatusTabs } from "./content-list";
import { DeleteContentDialog } from "./delete-content-dialog";
import type { Content } from "./types";

const pick = <T extends string>(allowed: readonly T[], value?: string) =>
  allowed.includes(value as T) ? (value as T) : undefined;

export function ContentsView() {
  const url = useUrlState();
  const status = pick(CONTENT_STATUSES, url.get("status"));
  const type = pick(CONTENT_TYPES, url.get("type"));
  const clientId = url.get("clientId");
  const q = url.get("q");
  const view = url.get("view") === "list" || status ? "list" : "board";
  const editId = url.get("edit");
  const creating = url.get("new") === "1";

  const clients = useClients();
  const contents = useContents({ status: view === "list" ? status : undefined, clientId, type, q });
  const [toDelete, setToDelete] = useState<Content>();

  const hasFilters = Boolean(status || type || clientId || q);
  const setQuery = useCallback((value?: string) => url.set({ q: value }), [url]);
  const openEdit = (content: Content) => url.set({ edit: content.id, new: null });
  const openCreate = (initialStatus?: ContentStatus) => url.set({ new: "1", edit: null, newStatus: initialStatus });
  const closeForm = () => url.set({ new: null, edit: null, newStatus: null });

  const statusCounts = contents.data?.meta.statusCounts;
  const total = statusCounts ? statusCounts.draft + statusCounts.in_review + statusCounts.published : undefined;

  return (
    <>
      <PageHeader
        eyebrow={total !== undefined && clients.data ? `${total} içerik · ${clients.data.length} müşteri` : " "}
        title="İçerik panosu"
        actions={
          <>
            <SearchInput value={q} onChange={setQuery} />
            <TypeSelect value={type} onChange={(value: ContentType | undefined) => url.set({ type: value })} />
            <div className="flex rounded-full bg-sunken p-1" role="group" aria-label="Görünüm">
              {[
                { key: "board", label: "Pano", icon: Columns3 },
                { key: "list", label: "Liste", icon: List },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={view === key}
                  onClick={() => url.set({ view: key === "list" ? "list" : null, status: key === "board" ? null : status })}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold",
                    view === key ? "bg-surface text-ink shadow-sm" : "text-muted",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </>
        }
      />

      {clients.data && <ClientChips clients={clients.data} value={clientId} onChange={(value) => url.set({ clientId: value })} />}

      {contents.isPending ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-96 rounded-panel" />
          ))}
        </div>
      ) : contents.isError ? (
        <ErrorState message={contents.error.message} onRetry={() => contents.refetch()} />
      ) : total === 0 && !hasFilters ? (
        <Panel>
          <EmptyState
            icon={<FileText className="size-5" />}
            title="Henüz içerik yok"
            description="Müşterilerin için ilk içeriği oluşturarak başla."
            action={<Button icon={<Plus className="size-4" />} onClick={() => openCreate()}>Yeni içerik</Button>}
          />
        </Panel>
      ) : view === "board" ? (
        <ContentBoard contents={contents.data.data} onEdit={openEdit} onDelete={setToDelete} onCreate={openCreate} />
      ) : (
        <Panel className="py-2 sm:py-3">
          <StatusTabs value={status} counts={statusCounts} onChange={(value) => url.set({ status: value, view: "list" })} />
          {contents.data.data.length === 0 ? (
            <EmptyState
              title="Bu filtrelere uygun içerik bulunamadı"
              action={
                <Button variant="ghost" size="sm" onClick={() => url.set({ status: null, type: null, clientId: null, q: null })}>
                  Filtreleri temizle
                </Button>
              }
            />
          ) : (
            <ContentList contents={contents.data.data} onEdit={openEdit} onDelete={setToDelete} />
          )}
        </Panel>
      )}

      <ContentFormDrawer
        open={creating || Boolean(editId)}
        contentId={editId}
        defaults={{ clientId, status: pick(CONTENT_STATUSES, url.get("newStatus")) }}
        onClose={closeForm}
        onDelete={setToDelete}
      />
      <DeleteContentDialog
        content={toDelete}
        onClose={() => setToDelete(undefined)}
        onDeleted={() => {
          setToDelete(undefined);
          if (editId === toDelete?.id) closeForm();
        }}
      />
    </>
  );
}
