import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";

export function ContentLink({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={href}
      aria-label="Bağlantıyı yeni sekmede aç"
      onClick={(event) => event.stopPropagation()}
      className={cn("inline-flex shrink-0 rounded-lg p-1 text-subtle hover:bg-sunken hover:text-ink", className)}
    >
      <ExternalLink className="size-4" />
    </a>
  );
}
