import { FileText, Globe, Image as ImageIcon, Shapes } from "lucide-react";
import { cn } from "@/lib/cn";
import { type ContentType, TYPE_LABELS } from "@/lib/labels";

const ICONS = { social_post: ImageIcon, blog_post: FileText, web_page: Globe, other: Shapes } as const;

const BADGE_STYLES: Record<ContentType, string> = {
  social_post: "bg-type-social-bg text-type-social-fg",
  blog_post: "bg-type-blog-bg text-type-blog-fg",
  web_page: "bg-type-web-bg text-type-web-fg",
  other: "bg-type-other-bg text-type-other-fg",
};

const SHORT_LABELS: Record<ContentType, string> = {
  social_post: "Sosyal medya",
  blog_post: "Blog",
  web_page: "Web sayfası",
  other: "Diğer",
};

export function TypeIcon({ type, className }: { type: ContentType; className?: string }) {
  const Icon = ICONS[type];
  return <Icon aria-hidden className={cn("size-4 shrink-0", className)} />;
}

export function TypeBadge({ type, className }: { type: ContentType; className?: string }) {
  return (
    <span
      title={TYPE_LABELS[type]}
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold whitespace-nowrap",
        BADGE_STYLES[type],
        className,
      )}
    >
      <TypeIcon type={type} className="size-3.5" />
      {SHORT_LABELS[type]}
    </span>
  );
}

export function TypeIconBox({ type }: { type: ContentType }) {
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", BADGE_STYLES[type])}>
      <TypeIcon type={type} />
    </span>
  );
}
