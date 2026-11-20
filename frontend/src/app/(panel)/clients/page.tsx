import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Müşteriler" };

export default function ClientsPage() {
  return <PageHeader title="Müşteriler" />;
}
