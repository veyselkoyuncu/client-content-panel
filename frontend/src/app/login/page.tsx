import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { StatusDot } from "@/components/ui/status-badge";
import { LoginForm } from "@/features/auth/login-form";
import { cn } from "@/lib/cn";
import { type ContentStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/labels";

export const metadata: Metadata = { title: "Giriş" };

const PREVIEW: Array<{ status: ContentStatus; count: number; title: string; meta: string }> = [
  { status: "draft", count: 9, title: "Filtre kahve demleme rehberi", meta: "27 Kas" },
  { status: "in_review", count: 8, title: "Kış menüsü lansmanı", meta: "Yarın" },
  { status: "published", count: 12, title: "İmplant hizmet sayfası", meta: "18 Kas" },
];

function FlowPreview() {
  return (
    <div aria-hidden className="flex flex-col gap-2.5">
      {PREVIEW.map((item, index) => (
        <div
          key={item.status}
          className={cn(
            "flex items-center gap-4 rounded-card p-4 shadow-[0_1px_2px_rgba(28,25,23,0.06)]",
            STATUS_STYLES[item.status].panel,
          )}
          style={{ marginLeft: index * 28, marginRight: (PREVIEW.length - 1 - index) * 28 }}
        >
          <span className="w-14 text-[32px] leading-none font-extrabold tracking-tighter">{item.count}</span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-bold">
              <StatusDot status={item.status} className="size-2" />
              {STATUS_LABELS[item.status]}
            </p>
            <p className="mt-1 truncate rounded-lg bg-surface px-2.5 py-1.5 text-[13px] font-semibold">{item.title}</p>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted">
            <CalendarDays className="size-3.5" />
            {item.meta}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="hidden flex-col justify-between bg-sunken/70 p-12 lg:flex xl:p-16">
        <Logo />
        <div className="max-w-lg">
          <h1 className="text-[40px] leading-[1.1] font-extrabold tracking-tight">
            Müşterilerinin tüm içerikleri <em className="rounded-[10px] bg-review-bg px-2 text-review-fg not-italic">tek akışta</em>.
          </h1>
          <p className="mt-4 text-base text-muted">
            Sosyal medya gönderilerinden web sayfalarına kadar her içeriği taslaktan yayına kadar takip et.
          </p>
          <div className="mt-10">
            <FlowPreview />
          </div>
        </div>
        <p className="text-xs text-subtle">Ajans hesap yöneticileri için müşteri ve içerik takip paneli</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-100">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <h2 className="text-[28px] font-extrabold tracking-tight">Tekrar hoş geldin</h2>
          <p className="mt-1 mb-7 text-sm text-muted">Hesabınla giriş yap ve içerik akışını takip et.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
