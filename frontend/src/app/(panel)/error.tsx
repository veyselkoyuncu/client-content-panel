"use client";

import { RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/states";

export default function PanelError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Panel>
      <EmptyState
        className="py-20"
        icon={<RotateCcw className="size-5" />}
        title="Bir şeyler ters gitti"
        description="Bu sayfa yüklenirken beklenmeyen bir hata oluştu. Tekrar deneyebilir ya da özete dönebilirsin."
        action={
          <div className="flex gap-2.5">
            <Button onClick={reset}>Tekrar dene</Button>
            <ButtonLink href="/" variant="ghost">
              Özete dön
            </ButtonLink>
          </div>
        }
      />
    </Panel>
  );
}
