import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-sunken", className)} />;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      {icon && <div className="flex size-12 items-center justify-center rounded-full bg-sunken text-muted">{icon}</div>}
      <div className="space-y-1">
        <p className="text-[15px] font-bold">{title}</p>
        {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message?: string; onRetry?: () => void; className?: string }) {
  return (
    <EmptyState
      className={className}
      icon={<AlertCircle className="size-5 text-danger" />}
      title="Veriler yüklenemedi"
      description={message ?? "Bir sorun oluştu. Lütfen tekrar deneyin."}
      action={
        onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Tekrar dene
          </Button>
        )
      }
    />
  );
}
