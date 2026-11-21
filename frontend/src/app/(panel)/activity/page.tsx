import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientOnly } from "@/components/client-only";
import { ActivityView } from "@/features/activity/activity-view";

export const metadata: Metadata = { title: "Hareketler" };

export default function ActivityPage() {
  return (
    <Suspense>
      <ClientOnly>
        <ActivityView />
      </ClientOnly>
    </Suspense>
  );
}
