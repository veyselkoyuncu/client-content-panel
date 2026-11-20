"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/overlay";
import { useDeleteContent } from "./api";
import type { Content } from "./types";

interface DeleteContentDialogProps {
  content?: Content;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteContentDialog({ content, onClose, onDeleted }: DeleteContentDialogProps) {
  const remove = useDeleteContent();

  return (
    <Dialog
      open={Boolean(content)}
      onClose={onClose}
      title="İçerik silinsin mi?"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={() => content && remove.mutate(content.id, { onSuccess: onDeleted })}
          >
            Sil
          </Button>
        </>
      }
    >
      <p>
        <strong className="text-ink">{content?.title}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.
      </p>
      {remove.isError && <p className="mt-3 font-semibold text-danger">{remove.error.message}</p>}
    </Dialog>
  );
}
