import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/top-nav";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto flex w-full max-w-360 flex-1 flex-col gap-7 px-4 pt-7 pb-12 sm:px-10 sm:pt-9">{children}</main>
    </div>
  );
}
