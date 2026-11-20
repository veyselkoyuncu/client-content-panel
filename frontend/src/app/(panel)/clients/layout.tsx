import { type ReactNode, Suspense } from "react";
import { ClientsShell } from "@/features/clients/clients-shell";

export default function ClientsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ClientsShell>{children}</ClientsShell>
    </Suspense>
  );
}
