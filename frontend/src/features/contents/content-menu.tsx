"use client";

import { Eye, MoreHorizontal, Pencil, Trash2, Undo2 } from "lucide-react";
import { Menu, type MenuSection } from "@/components/ui/menu";
import { StatusDot } from "@/components/ui/status-badge";
import { STATUS_LABELS } from "@/lib/labels";
import { ALLOWED_TRANSITIONS, isLocked } from "@/lib/transitions";
import { useUnpublishContent, useUpdateContentStatus } from "./api";
import type { Content } from "./types";

interface ContentMenuProps {
  content: Content;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContentMenu({ content, onEdit, onDelete }: ContentMenuProps) {
  const updateStatus = useUpdateContentStatus();
  const unpublish = useUnpublishContent();
  const locked = isLocked(content.status);

  const sections: MenuSection[] = locked
    ? [
        {
          title: "Yayında",
          items: [
            {
              key: "unpublish",
              label: "Yayından kaldır",
              icon: <Undo2 className="size-4" />,
              onSelect: () => unpublish.mutate(content.id),
            },
          ],
        },
        { items: [{ key: "view", label: "Görüntüle", icon: <Eye className="size-4" />, onSelect: onEdit }] },
      ]
    : [
        {
          title: "Duruma taşı",
          items: ALLOWED_TRANSITIONS[content.status].map((status) => ({
            key: status,
            label: STATUS_LABELS[status],
            icon: <StatusDot status={status} className="size-2" />,
            onSelect: () => updateStatus.mutate({ id: content.id, status }),
          })),
        },
        {
          items: [
            { key: "edit", label: "Düzenle", icon: <Pencil className="size-4" />, onSelect: onEdit },
            { key: "delete", label: "Sil", icon: <Trash2 className="size-4" />, danger: true, onSelect: onDelete },
          ],
        },
      ];

  return (
    <Menu
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={`${content.title} işlemleri`}
          className="rounded-lg p-1 text-subtle hover:bg-sunken hover:text-ink"
        >
          <MoreHorizontal className="size-4.5" />
        </button>
      )}
      sections={sections}
    />
  );
}
