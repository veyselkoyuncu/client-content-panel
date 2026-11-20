import { MousePointerClick } from "lucide-react";
import type { Metadata } from "next";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Müşteriler" };

export default function ClientsPage() {
  return (
    <Panel>
      <EmptyState
        icon={<MousePointerClick className="size-5" />}
        title="Bir müşteri seçin"
        description="Bilgilerini, içerik durumunu ve içeriklerini görmek için soldaki listeden bir müşteri seçin."
        className="py-24"
      />
    </Panel>
  );
}
