"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Drawer } from "@/components/ui/overlay";
import { ApiError, mergeErrors } from "@/lib/api";
import { type Client, type ClientInput, useSaveClient } from "./api";

const FORM_ID = "client-form";

const EMPTY: ClientInput = { name: "", contactName: null, email: null, phone: null, website: null, industry: null, notes: null };

const TEXT_FIELDS: Array<{ key: Exclude<keyof ClientInput, "name" | "notes">; label: string; type?: string; placeholder?: string }> = [
  { key: "industry", label: "Sektör", placeholder: "Örn. Yiyecek & İçecek" },
  { key: "contactName", label: "Yetkili kişi" },
  { key: "email", label: "E-posta", type: "email" },
  { key: "phone", label: "Telefon", type: "tel", placeholder: "+90 5xx xxx xx xx" },
  { key: "website", label: "Web sitesi", type: "url", placeholder: "https://" },
];

function ClientFormBody({ client, onSaved, onSavingChange }: { client?: Client; onSaved: (client: Client) => void; onSavingChange: (saving: boolean) => void }) {
  const save = useSaveClient(client?.id);
  const [values, setValues] = useState<ClientInput>(client ? { ...EMPTY, ...pickInput(client) } : EMPTY);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const apiError = save.error instanceof ApiError ? save.error : undefined;
  const errors = mergeErrors(apiError, localErrors);
  const formError = apiError && apiError.details.length === 0 ? apiError.message : undefined;

  const update = (key: keyof ClientInput, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setLocalErrors((current) => ({ ...current, [key]: "" }));
  };

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (values.name.trim().length < 2) {
      setLocalErrors({ name: "Müşteri adı en az 2 karakter olmalıdır." });
      return;
    }
    onSavingChange(true);
    save.mutate(values, { onSuccess: onSaved, onSettled: () => onSavingChange(false) });
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <p role="alert" className="rounded-xl bg-danger-bg px-3.5 py-2.5 text-sm font-semibold text-danger">
          {formError}
        </p>
      )}
      <Field label="Müşteri / marka adı" required error={errors.name}>
        {(props) => <Input {...props} value={values.name} maxLength={120} onChange={(e) => update("name", e.target.value)} />}
      </Field>
      {TEXT_FIELDS.map((field) => (
        <Field key={field.key} label={field.label} error={errors[field.key]}>
          {(props) => (
            <Input
              {...props}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              value={values[field.key] ?? ""}
              onChange={(e) => update(field.key, e.target.value)}
            />
          )}
        </Field>
      ))}
      <Field label="Notlar" error={errors.notes}>
        {(props) => (
          <Textarea {...props} rows={4} maxLength={2000} value={values.notes ?? ""} onChange={(e) => update("notes", e.target.value)} />
        )}
      </Field>
    </form>
  );
}

function pickInput(client: Client): ClientInput {
  const { name, contactName, email, phone, website, industry, notes } = client;
  return { name, contactName, email, phone, website, industry, notes };
}

interface ClientFormDrawerProps {
  open: boolean;
  client?: Client;
  onClose: () => void;
  onSaved: (client: Client) => void;
}

export function ClientFormDrawer({ open, client, onClose, onSaved }: ClientFormDrawerProps) {
  const [saving, setSaving] = useState(false);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow={client ? "Müşteriyi düzenle" : "Yeni müşteri"}
      title={client?.name ?? "Müşteri ekle"}
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            Kaydet
          </Button>
        </>
      }
    >
      <ClientFormBody key={client?.id ?? "new"} client={client} onSaved={onSaved} onSavingChange={setSaving} />
    </Drawer>
  );
}
