"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Menu } from "@/components/ui/menu";
import { StatusDot } from "@/components/ui/status-badge";
import { CONTENT_STATUSES, STATUS_LABELS } from "@/lib/labels";
import { useUpdateContentStatus } from "./api";
import type { Content } from "./types";

interface ContentMenuProps {
  content: Content;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContentMenu({ content, onEdit, onDelete }: ContentMenuProps) {
  const updateStatus = useUpdateContentStatus();

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
      sections={[
        {
          title: "Duruma taşı",
          items: CONTENT_STATUSES.map((status) => ({
            key: status,
            label: STATUS_LABELS[status],
            icon: <StatusDot status={status} className="size-2" />,
            checked: content.status === status,
            onSelect: () => {
              if (content.status !== status) updateStatus.mutate({ id: content.id, status });
            },
          })),
        },
        {
          items: [
            { key: "edit", label: "Düzenle", icon: <Pencil className="size-4" />, onSelect: onEdit },
            { key: "delete", label: "Sil", icon: <Trash2 className="size-4" />, danger: true, onSelect: onDelete },
          ],
        },
      ]}
    />
  );
}
