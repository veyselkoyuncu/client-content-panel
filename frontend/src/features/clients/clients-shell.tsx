"use client";

import { Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import { useUrlState } from "@/lib/use-url-state";
import { type Client, useClients } from "./api";
import { ClientFormDrawer } from "./client-form";

function clientMeta(client: Client) {
  if (client.contentCount === 0) return { text: "İçerik yok", tone: "text-subtle" };
  if (client.inReviewCount > 0) return { text: `${client.inReviewCount} onayda`, tone: "text-review-fg" };
  if (client.draftCount > 0) return { text: `${client.draftCount} taslak`, tone: "text-muted" };
  return { text: "Yolunda", tone: "text-published-fg" };
}

function ClientList({ activeId }: { activeId?: string }) {
  const [search, setSearch] = useState("");
  const clients = useClients(search.trim() || undefined);

  return (
    <div className="flex flex-col gap-3">
      <label className="flex h-10.5 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-muted focus-within:border-ink">
        <Search className="size-4" />
        <span className="sr-only">Müşteri ara</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Müşteri ara"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
        />
      </label>
      {clients.isPending ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-16" />
          ))}
        </div>
      ) : clients.isError ? (
        <ErrorState onRetry={() => clients.refetch()} />
      ) : clients.data.length === 0 ? (
        <EmptyState
          icon={<Users className="size-5" />}
          title={search ? "Eşleşen müşteri yok" : "Henüz müşteri yok"}
          description={search ? "Farklı bir arama deneyin." : "İlk müşterini ekleyerek başla."}
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {clients.data.map((client) => {
            const meta = clientMeta(client);
            const active = client.id === activeId;
            return (
              <li key={client.id}>
                <Link
                  href={`/clients/${client.id}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-card border px-3 py-2.5 transition-colors",
                    active ? "border-line bg-surface shadow-sm" : "border-transparent hover:bg-surface/70",
                  )}
                >
                  <Avatar name={client.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{client.name}</p>
                    <p className="truncate text-xs text-muted">{client.industry ?? "Sektör belirtilmedi"}</p>
                  </div>
                  <span className={cn("shrink-0 text-xs font-bold", meta.tone)}>{meta.text}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ClientsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const url = useUrlState();
  const activeId = pathname.split("/")[2];
  const clients = useClients();

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
      <aside className={cn("flex flex-col gap-4 xl:sticky xl:top-6", activeId && "max-xl:hidden")}>
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-extrabold tracking-tight">
            Müşteriler {clients.data && <span className="text-subtle">{clients.data.length}</span>}
          </h1>
          <Button size="sm" icon={<Plus className="size-4" />} onClick={() => url.set({ new: "1" })}>
            Yeni
          </Button>
        </div>
        <ClientList activeId={activeId} />
      </aside>
      <div className={cn("min-w-0", !activeId && "max-xl:hidden")}>{children}</div>
      <ClientFormDrawer
        open={url.get("new") === "1"}
        onClose={() => url.set({ new: null })}
        onSaved={(client) => router.push(`/clients/${client.id}`)}
      />
    </div>
  );
}
