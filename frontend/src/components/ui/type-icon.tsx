import { FileText, Globe, Image as ImageIcon, Shapes } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ContentType } from "@/lib/labels";

const ICONS = { social_post: ImageIcon, blog_post: FileText, web_page: Globe, other: Shapes } as const;

export function TypeIcon({ type, className }: { type: ContentType; className?: string }) {
  const Icon = ICONS[type];
  return <Icon aria-hidden className={cn("size-4 shrink-0", className)} />;
}
