import { Check } from "lucide-react";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-7.5 items-center justify-center rounded-full bg-ink text-white">
        <Check className="size-4" strokeWidth={3} />
      </span>
      <span className="text-[17px] font-extrabold tracking-tight">akış</span>
      <span className="hidden text-[13px] text-subtle sm:inline">içerik takip</span>
    </span>
  );
}
