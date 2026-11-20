"use client";

import { Columns3, Home, LogOut, Plus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/features/auth/api";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";

const NAV_ITEMS = [
  { href: "/", label: "Özet", icon: Home },
  { href: "/contents", label: "İçerik panosu", icon: Columns3 },
  { href: "/clients", label: "Müşteriler", icon: Users },
];

function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Ana menü" className={cn("flex gap-1 rounded-full bg-sunken p-1", className)}>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 flex-1 items-center justify-center gap-2 rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors sm:px-4 sm:text-sm",
              active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            <Icon className="hidden size-4 sm:block" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
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

  if (!user) {
    return <span className="size-10.5 rounded-full bg-sunken" />;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Kullanıcı menüsü"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full"
      >
        <Avatar name={user.name} size={42} shape="circle" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-56 rounded-2xl bg-ink p-2 text-white shadow-xl">
          <div className="px-3 py-2">
            <p className="text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-subtle">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-white/10" />
          <button
            type="button"
            role="menuitem"
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/10"
          >
            <LogOut className="size-4" />
            Çıkış yap
          </button>
        </div>
      )}
    </div>
  );
}

export function TopNav() {
  return (
    <header className="border-b border-line bg-canvas">
      <div className="mx-auto flex h-18 max-w-360 items-center justify-between gap-4 px-4 sm:px-10">
        <Link href="/" aria-label="Özet">
          <Logo />
        </Link>
        <NavLinks className="hidden md:flex" />
        <div className="flex items-center gap-2.5">
          <ButtonLink href="/contents?new=1" icon={<Plus className="size-4" />} className="max-sm:px-3">
            <span className="max-sm:sr-only">Yeni içerik</span>
          </ButtonLink>
          <UserMenu />
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <NavLinks />
      </div>
    </header>
  );
}
