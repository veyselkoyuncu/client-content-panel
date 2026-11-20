import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

type Variant = "ink" | "ghost" | "subtle" | "danger";
type Size = "md" | "sm" | "icon";

const variants: Record<Variant, string> = {
  ink: "bg-ink text-white hover:bg-ink-soft",
  ghost: "bg-surface text-ink border border-line hover:bg-canvas",
  subtle: "bg-transparent text-ink-soft hover:bg-sunken",
  danger: "bg-surface text-danger border border-line hover:bg-danger-bg",
};

const sizes: Record<Size, string> = {
  md: "h-10.5 px-4.5 text-sm gap-2",
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  icon: "size-10.5 justify-center",
};

export function buttonClass(variant: Variant = "ink", size: Size = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center rounded-full font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant, size, loading, icon, className, children, disabled, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function ButtonLink({ variant, size, icon, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
