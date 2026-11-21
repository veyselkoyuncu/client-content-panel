import { type ReactNode, Suspense } from "react";
import { ClientOnly } from "@/components/client-only";
import { ClientsShell } from "@/features/clients/clients-shell";

export default function ClientsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ClientOnly>
        <ClientsShell>{children}</ClientsShell>
      </ClientOnly>
    </Suspense>
  );
}
