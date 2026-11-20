import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const COLORS = ["#2563eb", "#db2777", "#0891b2", "#475569", "#7c3aed", "#c2410c", "#0f766e", "#4f46e5", "#b45309"];

function colorFor(seed: string) {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return COLORS[hash % COLORS.length];
}

interface AvatarProps {
  name: string;
  size?: number;
  shape?: "circle" | "square";
  className?: string;
}

export function Avatar({ name, size = 32, shape = "square", className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-extrabold text-white",
        shape === "circle" ? "rounded-full" : "rounded-[28%]",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36), backgroundColor: colorFor(name) }}
    >
      {initials(name)}
    </span>
  );
}
