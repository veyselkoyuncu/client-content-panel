"use client";

import { CircleAlert, CircleCheck, Info, Trash2, X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from "react";
import { StatusDot } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";
import type { ContentStatus } from "@/lib/labels";

export type ToastTone = "success" | "info" | "danger" | "error" | ContentStatus;

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

type Notify = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<Notify>(() => {});

const DURATION_MS = 3500;

const TONE_STYLES: Record<ToastTone, string> = {
  success: "bg-published-bg/95 text-published-fg border-published/20",
  info: "bg-type-social-bg/95 text-type-social-fg border-type-social-fg/15",
  danger: "bg-danger-bg/95 text-danger border-danger/15",
  error: "bg-danger-bg/95 text-danger border-danger/25",
  draft: "bg-draft-bg/95 text-draft-fg border-draft/30",
  in_review: "bg-review-bg/95 text-review-fg border-review/25",
  published: "bg-published-bg/95 text-published-fg border-published/20",
};

function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === "draft" || tone === "in_review" || tone === "published") {
    return <StatusDot status={tone} className="size-2.5" />;
  }
  const Icon = { success: CircleCheck, info: Info, danger: Trash2, error: CircleAlert }[tone];
  return <Icon className="size-4.5 shrink-0" />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const notify = useCallback<Notify>(
    (message, tone = "success") => {
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-70 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur",
              TONE_STYLES[toast.tone],
            )}
          >
            <ToastIcon tone={toast.tone} />
            <span className="flex-1 text-ink">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Bildirimi kapat"
              className="rounded-lg p-0.5 opacity-60 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
