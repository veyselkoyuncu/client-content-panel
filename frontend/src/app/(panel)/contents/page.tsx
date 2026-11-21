import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientOnly } from "@/components/client-only";
import { ContentsView } from "@/features/contents/contents-view";

export const metadata: Metadata = { title: "İçerik panosu" };

export default function ContentsPage() {
  return (
    <Suspense>
      <ClientOnly>
        <ContentsView />
      </ClientOnly>
    </Suspense>
  );
}
