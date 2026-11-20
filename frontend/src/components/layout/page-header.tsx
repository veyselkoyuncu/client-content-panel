import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-[13px] font-bold tracking-[0.08em] text-subtle uppercase">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl leading-tight font-extrabold tracking-tight sm:text-[38px]">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
