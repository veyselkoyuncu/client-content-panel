"use client";

import { Columns3, History, Home, LogOut, PanelLeftClose, PanelLeftOpen, Plus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { useCurrentUser, useLogout } from "@/features/auth/api";
import { useClients } from "@/features/clients/api";
import { cn } from "@/lib/cn";
import { Logo, LogoMark } from "./logo";

const NAV_ITEMS = [
  { href: "/", label: "Özet", icon: Home },
  { href: "/contents", label: "İçerik panosu", icon: Columns3 },
  { href: "/clients", label: "Müşteriler", icon: Users },
  { href: "/activity", label: "Hareketler", icon: History },
];

const CLIENT_SHORTCUTS = 5;

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed = false, onToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { data: clients } = useClients();
  const logout = useLogout();

  const shortcuts = [...(clients ?? [])].sort((a, b) => b.contentCount - a.contentCount).slice(0, CLIENT_SHORTCUTS);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const itemClass = (active: boolean) =>
    cn(
      "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
      collapsed && "justify-center px-0",
      active ? "bg-surface text-ink shadow-sm" : "text-muted hover:bg-surface/60 hover:text-ink",
    );

  return (
    <div className="flex h-full flex-col gap-6 bg-sunken/60 px-3 py-5">
      <div className={cn("flex items-center px-2", collapsed ? "flex-col gap-3 px-0" : "justify-between")}>
        <Link href="/" onClick={onNavigate} aria-label="Özet">
          {collapsed ? <LogoMark /> : <Logo />}
        </Link>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            aria-expanded={!collapsed}
            className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-ink"
          >
            {collapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
          </button>
        )}
      </div>

      <Link
        href="/contents?new=1"
        onClick={onNavigate}
        aria-label="Yeni içerik"
        title={collapsed ? "Yeni içerik" : undefined}
        className={cn(
          "flex h-10.5 items-center justify-center gap-2 rounded-full bg-ink text-sm font-bold text-white hover:bg-ink-soft",
          collapsed && "mx-auto size-10.5",
        )}
      >
        <Plus className="size-4" />
        {!collapsed && "Yeni içerik"}
      </Link>

      <nav aria-label="Ana menü" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive(href) ? "page" : undefined}
            title={collapsed ? label : undefined}
            className={itemClass(isActive(href))}
          >
            <Icon className="size-4.5 shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>

      {!collapsed && shortcuts.length > 0 && (
        <div className="flex min-h-0 flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">Öne çıkan müşteriler</p>
          {shortcuts.map((client) => {
            const href = `/clients/${client.id}`;
            return (
              <Link key={client.id} href={href} onClick={onNavigate} className={cn(itemClass(pathname === href), "h-9")}>
                <Avatar name={client.name} size={20} />
                <span className="flex-1 truncate">{client.name}</span>
                <span className="text-xs text-subtle">{client.contentCount}</span>
              </Link>
            );
          })}
        </div>
      )}

      <div className={cn("mt-auto flex items-center gap-3 rounded-2xl bg-surface p-2.5", collapsed && "flex-col p-2")}>
        {user ? <Avatar name={user.name} size={34} shape="circle" /> : <span className="size-8.5 rounded-full bg-sunken" />}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{user?.name}</p>
            <p className="truncate text-xs text-muted">Hesap yöneticisi</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => logout.mutate()}
          aria-label="Çıkış yap"
          title="Çıkış yap"
          className="rounded-lg p-1.5 text-muted hover:bg-sunken hover:text-ink"
        >
          <LogOut className="size-4.5" />
        </button>
      </div>
      {!collapsed && (
        <a
          href="https://lazyantlab.com"
          target="_blank"
          rel="noreferrer"
          className="-mt-4 text-center text-[11px] text-subtle hover:text-ink"
        >
          by Lazy Ant Lab
        </a>
      )}
    </div>
  );
}
