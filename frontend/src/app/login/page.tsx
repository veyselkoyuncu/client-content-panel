import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-100">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-panel border border-line-soft bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Tekrar hoş geldin</h1>
          <p className="mt-1 mb-6 text-sm text-muted">Müşterilerinin içeriklerini takip etmek için giriş yap.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
