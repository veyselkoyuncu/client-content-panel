import { Compass } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sayfa bulunamadı" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div className="flex size-14 items-center justify-center rounded-full bg-sunken text-muted">
        <Compass className="size-6" />
      </div>
      <div className="space-y-2">
        <p className="text-[13px] font-bold tracking-[0.08em] text-subtle uppercase">404</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Bu sayfa bulunamadı</h1>
        <p className="max-w-sm text-sm text-muted">Adres yanlış yazılmış ya da sayfa kaldırılmış olabilir.</p>
      </div>
      <ButtonLink href="/">Özete dön</ButtonLink>
    </main>
  );
}
