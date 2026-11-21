import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <path d="M22.6 6.6 20.4 2.8M25.3 8.4l3.9-1.6" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="9" cy="22.5" r="6.5" fill="var(--color-draft)" />
      <circle cx="16.6" cy="15.4" r="4.4" fill="var(--color-review)" />
      <circle cx="22.9" cy="9.5" r="3.3" fill="var(--color-published)" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="text-[17px] font-extrabold tracking-tight">antflow</span>
      <span className="text-[13px] text-subtle">içerik takip</span>
    </span>
  );
}
