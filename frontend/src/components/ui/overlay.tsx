"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useIsClient } from "@/lib/use-is-client";

function useOverlayBehavior(open: boolean, onClose: () => void, containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    containerRef.current?.querySelector<HTMLElement>("input, select, textarea, button:not([data-close])")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose, containerRef]);
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}

export function LeftSheet({ open, onClose, label, children }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  useOverlayBehavior(open, onClose, ref);
  if (!open || !isClient) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div aria-hidden className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className="relative h-full w-72 max-w-[85vw] shadow-2xl">
        {children}
      </div>
    </div>,
    document.body,
  );
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({ open, onClose, title, eyebrow, children, footer }: OverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const isClient = useIsClient();
  useOverlayBehavior(open, onClose, ref);
  if (!open || !isClient) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div aria-hidden className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full flex-col bg-surface shadow-2xl sm:max-w-120"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow && <p className="text-xs font-semibold text-muted">{eyebrow}</p>}
            <h2 id={titleId} className="truncate text-lg font-extrabold tracking-tight">
              {title}
            </h2>
          </div>
          <button type="button" data-close onClick={onClose} aria-label="Kapat" className="rounded-full p-1.5 text-muted hover:bg-sunken">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex items-center gap-2.5 border-t border-line-soft px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Dialog({ open, onClose, title, children, footer }: OverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const isClient = useIsClient();
  useOverlayBehavior(open, onClose, ref);
  if (!open || !isClient) return null;

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("relative w-full max-w-sm rounded-panel bg-surface p-6 shadow-2xl")}
      >
        <h2 id={titleId} className="text-lg font-extrabold tracking-tight">
          {title}
        </h2>
        <div className="mt-2 text-sm text-muted">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
