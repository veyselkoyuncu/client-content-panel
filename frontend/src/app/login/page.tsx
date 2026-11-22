import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { FlowPreview } from "@/features/auth/flow-preview";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Giriş" };

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
