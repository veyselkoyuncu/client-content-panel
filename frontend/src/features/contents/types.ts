import type { ContentStatus, ContentType } from "@/lib/labels";

export interface Content {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  dueDate: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string };
  body?: string | null;
  link: string | null;
}

export type StatusCounts = Record<ContentStatus, number>;
