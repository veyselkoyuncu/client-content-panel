import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "İçerik panosu" };

export default function ContentsPage() {
  return <PageHeader title="İçerik panosu" />;
}
