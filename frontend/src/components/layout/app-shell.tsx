"use client";

import { useQuery } from "@tanstack/react-query";
import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { LeftSheet } from "@/components/ui/overlay";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useLocalFlag } from "@/lib/use-local-flag";
import { version } from "../../../package.json";
import { Logo } from "./logo";
import { Sidebar } from "./sidebar";

function ApiStatus() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => api.get<{ status: string }>("/health"),
    refetchInterval: 60_000,
    retry: false,
  });
  const online = health.data?.status === "ok";
  const label = health.isPending ? "API kontrol ediliyor" : online ? "API çalışıyor" : "API'ye ulaşılamıyor";
  return (
    <span className="flex items-center gap-1.5" role="status">
      <span
        aria-hidden
        className={cn("size-2 rounded-full", health.isPending ? "bg-subtle" : online ? "bg-published" : "bg-danger")}
      />
      {label}
    </span>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-360 flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted sm:px-10">
        <span>akış · Müşteri ve İçerik Takip Paneli · v{version}</span>
        <ApiStatus />
      </div>
    </footer>
  );
}

function MobileBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur lg:hidden">
      <button type="button" onClick={onMenu} aria-label="Menüyü aç" className="-ml-1.5 rounded-lg p-1.5 hover:bg-sunken">
        <Menu className="size-5.5" />
      </button>
      <Link href="/" aria-label="Özet">
        <Logo />
      </Link>
      <Link
        href="/contents?new=1"
        aria-label="Yeni içerik"
        className="flex size-9 items-center justify-center rounded-full bg-ink text-white"
      >
        <Plus className="size-4.5" />
      </Link>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useLocalFlag("sidebar-collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-line transition-[width] duration-200 lg:block",
          collapsed ? "w-19" : "w-66",
        )}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      <LeftSheet open={mobileOpen} onClose={() => setMobileOpen(false)} label="Menü">
        <div className="h-full bg-canvas">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </LeftSheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileBar onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto flex w-full max-w-360 flex-1 flex-col gap-7 px-4 pt-6 pb-12 sm:px-10 sm:pt-9">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
