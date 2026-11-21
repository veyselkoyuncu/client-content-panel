"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import type { Client } from "@/features/clients/api";
import { cn } from "@/lib/cn";
import { CONTENT_TYPES, type ContentType, TYPE_LABELS } from "@/lib/labels";

const chip = "flex h-9.5 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap";

const VISIBLE_CHIPS = 5;
const CHIP_VISIBILITY = ["", "", "max-sm:hidden", "max-sm:hidden", "max-lg:hidden"];

function ClientPicker({ clients, value, onChange }: { clients: Client[]; value?: string; onChange: (clientId?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const term = search.trim().toLocaleLowerCase("tr-TR");
  const matches = term ? clients.filter((client) => client.name.toLocaleLowerCase("tr-TR").includes(term)) : clients;
  const hiddenCount = (shown: number) => Math.max(0, clients.length - shown);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Tüm müşterilerden seç"
        onClick={() => setOpen((current) => !current)}
        className={cn(chip, "border-line bg-surface text-ink-soft hover:border-ink")}
      >
        <span className="sm:hidden">+{hiddenCount(2)}</span>
        <span className="max-sm:hidden lg:hidden">+{hiddenCount(4)}</span>
        <span className="max-lg:hidden">+{hiddenCount(VISIBLE_CHIPS)}</span>
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-line bg-surface p-2 shadow-xl sm:left-0">
          <label className="flex h-9.5 items-center gap-2 rounded-xl border border-line px-3 text-muted focus-within:border-ink">
            <Search className="size-4" />
            <span className="sr-only">Müşteri ara</span>
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Müşteri ara"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
            />
          </label>
          <ul role="listbox" aria-label="Müşteriler" className="mt-1.5 max-h-72 overflow-y-auto">
            {matches.map((client) => (
              <li key={client.id} role="option" aria-selected={value === client.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(client.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-semibold hover:bg-canvas",
                    value === client.id && "bg-canvas",
                  )}
                >
                  <Avatar name={client.name} size={24} />
                  <span className="flex-1 truncate">{client.name}</span>
                  <span className="text-xs text-muted">{client.contentCount}</span>
                  {value === client.id && <Check className="size-4" />}
                </button>
              </li>
            ))}
            {matches.length === 0 && <li className="px-2.5 py-3 text-sm text-muted">Eşleşen müşteri yok.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ClientChips({
  clients,
  value,
  onChange,
}: {
  clients: Client[];
  value?: string;
  onChange: (clientId?: string) => void;
}) {
  const ranked = [...clients].sort((a, b) => b.contentCount - a.contentCount);
  const selected = ranked.find((client) => client.id === value);
  const top = ranked.slice(0, VISIBLE_CHIPS);
  const chips = selected && !top.includes(selected) ? [selected, ...top.slice(0, VISIBLE_CHIPS - 1)] : top;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => onChange(undefined)}
        className={cn(chip, !value ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft")}
      >
        Tüm müşteriler
      </button>
      {chips.map((client, index) => (
        <button
          key={client.id}
          type="button"
          aria-pressed={value === client.id}
          onClick={() => onChange(value === client.id ? undefined : client.id)}
          className={cn(
            chip,
            value === client.id ? "border-ink bg-ink text-white" : cn("border-line bg-surface text-ink-soft", CHIP_VISIBILITY[index]),
          )}
        >
          <Avatar name={client.name} size={20} />
          <span className="max-w-36 truncate">{client.name}</span>
        </button>
      ))}
      {clients.length > 2 && <ClientPicker clients={ranked} value={value} onChange={onChange} />}
    </div>
  );
}

export function TypeSelect({ value, onChange }: { value?: ContentType; onChange: (type?: ContentType) => void }) {
  return (
    <select
      aria-label="İçerik türü"
      value={value ?? ""}
      onChange={(event) => onChange((event.target.value || undefined) as ContentType | undefined)}
      className={cn(chip, "min-w-0 border-line bg-surface pr-8 text-ink-soft")}
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
    <label className={cn(chip, "border-line bg-surface text-muted focus-within:border-ink max-sm:col-span-2")}>
      <Search className="size-4" />
      <span className="sr-only">Başlıkta ara</span>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Ara"
        className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-muted sm:w-36"
      />
      {text && (
        <button type="button" aria-label="Aramayı temizle" onClick={() => setText("")}>
          <X className="size-3.5" />
        </button>
      )}
    </label>
  );
}
