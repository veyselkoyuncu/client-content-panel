import { Check } from "lucide-react";

export function LogoMark() {
  return (
    <span className="flex size-7.5 items-center justify-center rounded-full bg-ink text-white">
      <Check className="size-4" strokeWidth={3} />
    </span>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[17px] font-extrabold tracking-tight">akış</span>
      <span className="text-[13px] text-subtle">içerik takip</span>
    </span>
  );
}
