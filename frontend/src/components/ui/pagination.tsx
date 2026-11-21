import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  label?: string;
}

function pageList(current: number, count: number): Array<number | "gap"> {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const pages = new Set([1, count, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= count).sort((a, b) => a - b);
  return sorted.flatMap((page, index) => (index > 0 && page - sorted[index - 1]! > 1 ? ["gap" as const, page] : [page]));
}

export function Pagination({ page, pageSize, total, onChange, label = "kayıt" }: PaginationProps) {
  const count = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const arrow = "flex size-9 items-center justify-center rounded-full border border-line bg-surface disabled:opacity-40";

  return (
    <nav aria-label="Sayfalama" className="flex flex-wrap items-center justify-between gap-3 pt-3">
      <p className="text-[13px] text-muted">
        <span className="font-bold text-ink">
          {from}–{to}
        </span>{" "}
        / {total} {label}
      </p>
      {count > 1 && (
        <div className="flex items-center gap-1.5">
          <button type="button" className={arrow} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Önceki sayfa">
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1 rounded-full bg-sunken p-1">
            {pageList(page, count).map((item, index) =>
              item === "gap" ? (
                <span key={`gap-${index}`} className="px-1 text-xs text-muted">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => onChange(item)}
                  className={cn(
                    "h-7 min-w-7 rounded-full px-2 text-[13px] font-bold",
                    item === page ? "bg-ink text-white" : "text-muted hover:bg-surface hover:text-ink",
                  )}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <button type="button" className={arrow} disabled={page >= count} onClick={() => onChange(page + 1)} aria-label="Sonraki sayfa">
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
