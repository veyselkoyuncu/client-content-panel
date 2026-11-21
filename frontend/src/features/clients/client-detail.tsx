"use client";

import { ArrowLeft, CalendarDays, Clock, FileText, Globe, Mail, MoreHorizontal, Pencil, Phone, Plus, Send, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { Dialog } from "@/components/ui/overlay";
import { Panel } from "@/components/ui/panel";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useContents } from "@/features/contents/api";
import { ContentFormDrawer } from "@/features/contents/content-form";
import { ContentList, StatusTabs } from "@/features/contents/content-list";
import { DeleteContentDialog } from "@/features/contents/delete-content-dialog";
import type { Content } from "@/features/contents/types";
import { ApiError } from "@/lib/api";
import { formatDueDate, formatLongDate } from "@/lib/format";
import type { ContentStatus } from "@/lib/labels";
import { useUrlState } from "@/lib/use-url-state";
import { type Client, useClient, useDeleteClient } from "./api";
import { ClientFormDrawer } from "./client-form";

function InfoChip({ icon, children, href }: { icon: ReactNode; children: ReactNode; href?: string }) {
  const className = "inline-flex max-w-full items-center gap-1.5 rounded-lg bg-sunken px-2.5 py-1 text-xs font-semibold text-ink-soft";
  const content = (
    <>
      {icon}
      <span className="truncate">{children}</span>
    </>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={`${className} hover:bg-line`}>
      {content}
    </a>
  ) : (
    <span className={className}>{content}</span>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-4 sm:p-5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        {icon}
        {label}
      </span>
      <span className="text-2xl font-extrabold tracking-tight sm:text-[28px]">{value}</span>
    </div>
  );
}

function DeleteClientDialog({ client, open, onClose }: { client: Client; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const remove = useDeleteClient();
  const blocked = remove.error instanceof ApiError && remove.error.code === "CLIENT_HAS_CONTENTS";
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Müşteri silinsin mi?"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          {!blocked && (
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={() => remove.mutate(client.id, { onSuccess: () => router.replace("/clients") })}
            >
              Sil
            </Button>
          )}
        </>
      }
    >
      {client.contentCount > 0 || blocked ? (
        <p>
          <strong className="text-ink">{client.name}</strong> müşterisine bağlı {client.contentCount} içerik var. Müşteriyi silmeden önce içeriklerini silmelisiniz.
        </p>
      ) : (
        <p>
          <strong className="text-ink">{client.name}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.
        </p>
      )}
      {remove.isError && !blocked && <p className="mt-3 font-semibold text-danger">{remove.error.message}</p>}
    </Dialog>
  );
}

function ClientContents({ client, onCreate, onEdit, onDelete }: { client: Client; onCreate: () => void; onEdit: (content: Content) => void; onDelete: (content: Content) => void }) {
  const [status, setStatus] = useState<ContentStatus>();
  const contents = useContents({ clientId: client.id, status });

  return (
    <Panel className="py-2 sm:py-3">
      <StatusTabs value={status} counts={contents.data?.meta.statusCounts} onChange={setStatus} />
      {contents.isPending ? (
        <div className="flex flex-col gap-2 py-4">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-12" />
          ))}
        </div>
      ) : contents.isError ? (
        <ErrorState onRetry={() => contents.refetch()} />
      ) : contents.data.data.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" />}
          title={status ? "Bu durumda içerik yok" : "Bu müşteri için henüz içerik yok"}
          action={
            !status && (
              <Button size="sm" icon={<Plus className="size-4" />} onClick={onCreate}>
                İçerik ekle
              </Button>
            )
          }
        />
      ) : (
        <ContentList contents={contents.data.data} onEdit={onEdit} onDelete={onDelete} />
      )}
    </Panel>
  );
}

export function ClientDetail({ id }: { id: string }) {
  const client = useClient(id);
  const clientName = client.data?.name;

  useEffect(() => {
    if (clientName) document.title = `${clientName} · akış`;
  }, [clientName]);
  const url = useUrlState();
  const [deleting, setDeleting] = useState(false);
  const [contentForm, setContentForm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [contentToDelete, setContentToDelete] = useState<Content>();

  if (client.isPending) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-24 rounded-panel" />
        <Skeleton className="h-28 rounded-panel" />
        <Skeleton className="h-80 rounded-panel" />
      </div>
    );
  }
  if (client.isError) {
    const notFound = client.error instanceof ApiError && client.error.status === 404;
    return (
      <Panel>
        {notFound ? (
          <EmptyState title="Müşteri bulunamadı" description="Silinmiş ya da hiç var olmamış olabilir." action={<Link href="/clients" className="text-sm font-bold underline">Müşterilere dön</Link>} />
        ) : (
          <ErrorState message={client.error.message} onRetry={() => client.refetch()} />
        )}
      </Panel>
    );
  }

  const data = client.data;
  return (
    <div className="flex flex-col gap-5">
      <Link href="/clients" className="flex items-center gap-1.5 text-sm font-bold text-muted xl:hidden">
        <ArrowLeft className="size-4" /> Müşteriler
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={data.name} size={64} />
          <div className="min-w-0">
            <h2 className="text-[28px] leading-tight font-extrabold tracking-tight">{data.name}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.industry && <InfoChip icon={<FileText className="size-3.5" />}>{data.industry}</InfoChip>}
              {data.contactName && <InfoChip icon={<User className="size-3.5" />}>{data.contactName}</InfoChip>}
              {data.email && <InfoChip icon={<Mail className="size-3.5" />} href={`mailto:${data.email}`}>{data.email}</InfoChip>}
              {data.phone && <InfoChip icon={<Phone className="size-3.5" />} href={`tel:${data.phone.replace(/\s/g, "")}`}>{data.phone}</InfoChip>}
              {data.website && <InfoChip icon={<Globe className="size-3.5" />} href={data.website}>{data.website.replace(/^https?:\/\//, "")}</InfoChip>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" icon={<Pencil className="size-4" />} onClick={() => url.set({ edit: "1" })}>
            Düzenle
          </Button>
          <Button icon={<Plus className="size-4" />} onClick={() => setContentForm({ open: true })}>
            İçerik ekle
          </Button>
          <Menu
            trigger={(props) => (
              <button type="button" {...props} aria-label="Diğer işlemler" className="flex size-10.5 items-center justify-center rounded-full border border-line bg-surface">
                <MoreHorizontal className="size-4.5" />
              </button>
            )}
            sections={[{ items: [{ key: "delete", label: "Müşteriyi sil", icon: <Trash2 className="size-4" />, danger: true, onSelect: () => setDeleting(true) }] }]}
          />
        </div>
      </div>

      <section className="grid grid-cols-2 divide-line-soft rounded-panel border border-line-soft bg-surface max-sm:[&>*:nth-child(-n+2)]:border-b max-sm:[&>*:nth-child(-n+2)]:border-line-soft sm:grid-cols-4 sm:divide-x">
        <Stat icon={<FileText className="size-3.5" />} label="Toplam içerik" value={data.contentCount} />
        <Stat icon={<Clock className="size-3.5 text-review" />} label="Onay bekleyen" value={data.inReviewCount} />
        <Stat icon={<CalendarDays className="size-3.5" />} label="Sonraki teslim" value={data.nextDueDate ? formatDueDate(data.nextDueDate) : "—"} />
        <Stat icon={<Send className="size-3.5 text-published" />} label="Yayında" value={data.publishedCount} />
      </section>

      {data.notes && (
        <Panel className="py-4 sm:py-5">
          <p className="text-xs font-bold tracking-[0.08em] text-subtle uppercase">Notlar</p>
          <p className="mt-1.5 text-sm whitespace-pre-line text-ink-soft">{data.notes}</p>
        </Panel>
      )}

      <ClientContents
        client={data}
        onCreate={() => setContentForm({ open: true })}
        onEdit={(content) => setContentForm({ open: true, id: content.id })}
        onDelete={setContentToDelete}
      />

      <p className="text-xs text-subtle">Eklenme: {formatLongDate(data.createdAt)} · Son güncelleme: {formatLongDate(data.updatedAt)}</p>

      <ClientFormDrawer open={url.get("edit") === "1"} client={data} onClose={() => url.set({ edit: null })} onSaved={() => url.set({ edit: null })} />
      <ContentFormDrawer
        open={contentForm.open}
        contentId={contentForm.id}
        defaults={{ clientId: data.id }}
        onClose={() => setContentForm({ open: false })}
        onDelete={setContentToDelete}
      />
      <DeleteContentDialog
        content={contentToDelete}
        onClose={() => setContentToDelete(undefined)}
        onDeleted={() => {
          if (contentForm.id === contentToDelete?.id) setContentForm({ open: false });
          setContentToDelete(undefined);
        }}
      />
      <DeleteClientDialog client={data} open={deleting} onClose={() => setDeleting(false)} />
    </div>
  );
}
