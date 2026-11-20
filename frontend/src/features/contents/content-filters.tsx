"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import type { Client } from "@/features/clients/api";
import { cn } from "@/lib/cn";
import { CONTENT_TYPES, type ContentType, TYPE_LABELS } from "@/lib/labels";

const chip = "flex h-9.5 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap";

export function ClientChips({
  clients,
  value,
  onChange,
}: {
  clients: Client[];
  value?: string;
  onChange: (clientId?: string) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => onChange(undefined)}
        className={cn(chip, !value ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft")}
      >
        Tüm müşteriler
      </button>
      {clients.map((client) => (
        <button
          key={client.id}
          type="button"
          aria-pressed={value === client.id}
          onClick={() => onChange(value === client.id ? undefined : client.id)}
          className={cn(chip, value === client.id ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft")}
        >
          <Avatar name={client.name} size={20} />
          {client.name}
        </button>
      ))}
    </div>
  );
}

export function TypeSelect({ value, onChange }: { value?: ContentType; onChange: (type?: ContentType) => void }) {
  return (
    <select
      aria-label="İçerik türü"
      value={value ?? ""}
      onChange={(event) => onChange((event.target.value || undefined) as ContentType | undefined)}
      className={cn(chip, "border-line bg-surface pr-8 text-ink-soft")}
    >
      <option value="">Tür: Tümü</option>
      {CONTENT_TYPES.map((type) => (
        <option key={type} value={type}>
          {TYPE_LABELS[type]}
        </option>
      ))}
    </select>
  );
}

export function SearchInput({ value, onChange }: { value?: string; onChange: (q?: string) => void }) {
  const [text, setText] = useState(value ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim() !== (value ?? "")) onChange(text.trim() || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <label className={cn(chip, "border-line bg-surface text-muted focus-within:border-ink")}>
      <Search className="size-4" />
      <span className="sr-only">Başlıkta ara</span>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Ara"
        className="w-24 bg-transparent text-ink outline-none placeholder:text-muted sm:w-36"
      />
      {text && (
        <button type="button" aria-label="Aramayı temizle" onClick={() => setText("")}>
          <X className="size-3.5" />
        </button>
      )}
    </label>
  );
}
