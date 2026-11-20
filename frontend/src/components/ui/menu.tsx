"use client";

import { Check } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface MenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  checked?: boolean;
  danger?: boolean;
  onSelect: () => void;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}

interface MenuProps {
  trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "menu" }) => ReactNode;
  sections: MenuSection[];
  align?: "left" | "right";
}

export function Menu({ trigger, sections, align = "right" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ onClick: () => setOpen((value) => !value), "aria-expanded": open, "aria-haspopup": "menu" })}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-40 mt-2 w-52 rounded-2xl bg-ink p-1.5 text-white shadow-xl",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {sections.map((section, index) => (
            <div key={section.title ?? index} className={cn(index > 0 && "mt-1 border-t border-white/10 pt-1")}>
              {section.title && (
                <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role={item.checked === undefined ? "menuitem" : "menuitemradio"}
                  aria-checked={item.checked}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-semibold hover:bg-white/10",
                    item.checked && "bg-white/10",
                    item.danger && "text-red-400",
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.checked && <Check className="size-4" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
