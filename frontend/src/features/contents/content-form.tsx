"use client";

import { Lock, Trash2, Undo2, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Drawer } from "@/components/ui/overlay";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { StatusDot } from "@/components/ui/status-badge";
import { TypeIcon } from "@/components/ui/type-icon";
import { useClients } from "@/features/clients/api";
import { ApiError, mergeErrors } from "@/lib/api";
import { cn } from "@/lib/cn";
import { CONTENT_STATUSES, CONTENT_TYPES, type ContentStatus, STATUS_LABELS, TYPE_LABELS } from "@/lib/labels";
import { ALLOWED_TRANSITIONS, INITIAL_STATUSES, isLocked } from "@/lib/transitions";
import { type ContentInput, useContent, useSaveContent, useUnpublishContent } from "./api";
import { ContentHistory } from "./content-history";
import type { Content } from "./types";

const FORM_ID = "content-form";

const segment = (active: boolean) =>
  cn(
    "flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-[13px] font-semibold transition-colors",
    active ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft hover:bg-canvas",
  );

interface FormBodyProps {
  initial: ContentInput;
  contentId?: string;
  readOnly: boolean;
  onSaved: () => void;
  onSavingChange: (saving: boolean) => void;
}

function ContentFormBody({ initial, contentId, readOnly, onSaved, onSavingChange }: FormBodyProps) {
  const statusOptions: readonly ContentStatus[] = contentId
    ? [initial.status, ...ALLOWED_TRANSITIONS[initial.status]]
    : INITIAL_STATUSES;
  const clients = useClients();
  const save = useSaveContent(contentId);
  const [values, setValues] = useState(initial);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const apiError = save.error instanceof ApiError ? save.error : undefined;
  const errors = mergeErrors(apiError, localErrors);
  const formError = apiError && apiError.details.length === 0 ? apiError.message : undefined;

  const update = <K extends keyof ContentInput>(key: K, value: ContentInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setLocalErrors((current) => ({ ...current, [key]: "" }));
  };

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!values.clientId) nextErrors.clientId = "Müşteri seçin.";
    if (values.title.trim().length < 3) nextErrors.title = "Başlık en az 3 karakter olmalıdır.";
    setLocalErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSavingChange(true);
    save.mutate(
      {
        ...values,
        title: values.title.trim(),
        body: values.body?.trim() || null,
        link: values.link?.trim() || null,
        dueDate: values.dueDate || null,
      },
      { onSuccess: onSaved, onSettled: () => onSavingChange(false) },
    );
  }

  if (clients.isPending) return <Skeleton className="h-96" />;
  if (clients.isError) return <ErrorState onRetry={() => clients.refetch()} />;
  if (clients.data.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-5" />}
        title="Önce bir müşteri ekleyin"
        description="Her içerik bir müşteriye bağlıdır."
        action={<ButtonLink href="/clients?new=1" size="sm">Müşteri ekle</ButtonLink>}
      />
    );
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <p role="alert" className="rounded-xl bg-danger-bg px-3.5 py-2.5 text-sm font-semibold text-danger">
          {formError}
        </p>
      )}
      {readOnly && (
        <p className="flex items-start gap-2 rounded-xl bg-published-bg px-3.5 py-2.5 text-sm font-semibold text-published-fg">
          <Lock className="mt-0.5 size-4 shrink-0" />
          Bu içerik yayında ve kilitli. Değişiklik yapmak için önce yayından kaldırın.
        </p>
      )}
      <fieldset disabled={readOnly} className="contents">
      <Field label="Başlık" required error={errors.title}>
        {(props) => (
          <Input {...props} value={values.title} maxLength={200} onChange={(e) => update("title", e.target.value)} />
        )}
      </Field>
      <Field label="Müşteri" required error={errors.clientId}>
        {(props) => (
          <Select {...props} value={values.clientId} onChange={(e) => update("clientId", e.target.value)}>
            <option value="">Müşteri seçin</option>
            {clients.data.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-[13px] font-bold text-ink-soft">İçerik türü</legend>
        <div className="grid grid-cols-2 gap-2">
          {CONTENT_TYPES.map((type) => (
            <button key={type} type="button" aria-pressed={values.type === type} onClick={() => update("type", type)} className={segment(values.type === type)}>
              <TypeIcon type={type} />
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        {errors.type && <p className="text-xs font-semibold text-danger">{errors.type}</p>}
      </fieldset>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-[13px] font-bold text-ink-soft">Durum</legend>
        <div className="grid grid-cols-3 gap-2">
          {CONTENT_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={values.status === status}
              disabled={!statusOptions.includes(status)}
              onClick={() => update("status", status)}
              className={cn(segment(values.status === status), "disabled:cursor-not-allowed disabled:opacity-40")}
            >
              <StatusDot status={status} className="size-2" />
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
        {!readOnly && (
          <p className="text-xs text-muted">
            {contentId ? "Akış: Taslak → Onayda → Yayında. Onaydaki içerik revizyon için taslağa dönebilir." : "Yeni içerik Taslak ya da Onayda olarak başlar."}
          </p>
        )}
        {errors.status && <p className="text-xs font-semibold text-danger">{errors.status}</p>}
      </fieldset>
      <Field label="Teslim tarihi" error={errors.dueDate} hint="Planlanan yayın tarihi.">
        {(props) => (
          <Input {...props} type="date" value={values.dueDate ?? ""} onChange={(e) => update("dueDate", e.target.value || null)} />
        )}
      </Field>
      <Field label="Bağlantı" error={errors.link} hint="Yayın, taslak dosyası ya da önizleme adresi.">
        {(props) => (
          <Input
            {...props}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={values.link ?? ""}
            onChange={(e) => update("link", e.target.value)}
          />
        )}
      </Field>
      <Field label="Notlar / içerik metni" error={errors.body}>
        {(props) => (
          <Textarea
            {...props}
            rows={5}
            maxLength={10000}
            value={values.body ?? ""}
            placeholder="Brif, metin taslağı ya da müşteri notları"
            onChange={(e) => update("body", e.target.value)}
          />
        )}
      </Field>
      </fieldset>
    </form>
  );
}

interface ContentFormDrawerProps {
  open: boolean;
  contentId?: string;
  defaults?: { clientId?: string; status?: ContentStatus };
  onClose: () => void;
  onDelete: (content: Content) => void;
}

export function ContentFormDrawer({ open, contentId, defaults, onClose, onDelete }: ContentFormDrawerProps) {
  const existing = useContent(contentId);
  const unpublish = useUnpublishContent();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(contentId);
  const readOnly = Boolean(existing.data && isLocked(existing.data.status));
  const defaultStatus = defaults?.status && INITIAL_STATUSES.includes(defaults.status) ? defaults.status : "draft";

  const initial: ContentInput | undefined = isEdit
    ? existing.data && {
        clientId: existing.data.client.id,
        title: existing.data.title,
        type: existing.data.type,
        status: existing.data.status,
        dueDate: existing.data.dueDate,
        body: existing.data.body ?? null,
        link: existing.data.link,
      }
    : {
        clientId: defaults?.clientId ?? "",
        title: "",
        type: "social_post",
        status: defaultStatus,
        dueDate: null,
        body: null,
        link: null,
      };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow={!isEdit ? "Yeni içerik" : readOnly ? "Yayındaki içerik" : "İçeriği düzenle"}
      title={isEdit ? (existing.data?.title ?? "İçerik") : "İçerik oluştur"}
      footer={
        readOnly && existing.data ? (
          <>
            <Button
              variant="ghost"
              icon={<Undo2 className="size-4" />}
              loading={unpublish.isPending}
              onClick={() => unpublish.mutate(existing.data.id)}
            >
              Yayından kaldır
            </Button>
            <span className="flex-1" />
            <Button onClick={onClose}>Kapat</Button>
          </>
        ) : (
          <>
            {isEdit && existing.data && (
              <Button variant="danger" size="sm" icon={<Trash2 className="size-4" />} onClick={() => onDelete(existing.data)}>
                Sil
              </Button>
            )}
            <span className="flex-1" />
            <Button variant="ghost" onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" form={FORM_ID} loading={saving}>
              Kaydet
            </Button>
          </>
        )
      }
    >
      {isEdit && existing.isError ? (
        <ErrorState message={existing.error.message} onRetry={() => existing.refetch()} />
      ) : initial ? (
        <>
          <ContentFormBody
            key={`${contentId ?? "new"}-${existing.data?.status ?? ""}`}
            initial={initial}
            contentId={contentId}
            readOnly={readOnly}
            onSaved={onClose}
            onSavingChange={setSaving}
          />
          {contentId && <ContentHistory contentId={contentId} />}
        </>
      ) : (
        <Skeleton className="h-96" />
      )}
    </Drawer>
  );
}
