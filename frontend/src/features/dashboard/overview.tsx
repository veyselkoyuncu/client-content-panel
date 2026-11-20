"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useCurrentUser } from "@/features/auth/api";
import { formatToday, greeting } from "@/lib/format";

export function Overview() {
  const { data: user } = useCurrentUser();
  const firstName = user?.name.split(" ")[0];

  return <PageHeader eyebrow={formatToday()} title={`${greeting()}${firstName ? ` ${firstName}` : ""}`} />;
}
