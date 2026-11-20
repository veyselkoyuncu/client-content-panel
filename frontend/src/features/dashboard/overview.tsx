"use client";

import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { useCurrentUser } from "@/features/auth/api";
import { useClients } from "@/features/clients/api";
import { formatToday, greeting } from "@/lib/format";
import { useDashboardSummary } from "./api";
import { AttentionPanel } from "./attention-panel";
import { ClientDistribution } from "./client-distribution";
import { StatusFlow } from "./status-flow";

function Headline({ name, inReview }: { name?: string; inReview?: number }) {
  const hello = `${greeting()}${name ? ` ${name}` : ""}`;
  if (inReview === undefined) return <>{hello}</>;
  return (
    <>
      {hello},{" "}
      <span className="max-sm:block">
        {inReview > 0 ? (
          <>
            <em className="rounded-[10px] bg-review-bg px-2 text-review-fg not-italic">{inReview} içerik</em> onay bekliyor.
          </>
        ) : (
          "onay bekleyen içerik yok."
        )}
      </span>
    </>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-59 flex-1 rounded-panel" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Skeleton className="h-96 rounded-panel" />
        <Skeleton className="h-96 rounded-panel" />
      </div>
    </>
  );
}

export function Overview() {
  const { data: user } = useCurrentUser();
  const summary = useDashboardSummary();
  const clients = useClients();

  return (
    <>
      <PageHeader
        eyebrow={formatToday()}
        title={<Headline name={user?.name.split(" ")[0]} inReview={summary.data?.contentsByStatus.in_review} />}
        actions={
          <ButtonLink href="/clients?new=1" variant="ghost" icon={<UserPlus className="size-4" />}>
            Müşteri ekle
          </ButtonLink>
        }
      />

      {summary.isPending || clients.isPending ? (
        <OverviewSkeleton />
      ) : summary.isError || clients.isError ? (
        <ErrorState
          message={(summary.error ?? clients.error)?.message}
          onRetry={() => {
            void summary.refetch();
            void clients.refetch();
          }}
        />
      ) : (
        <>
          <StatusFlow summary={summary.data} />
          <div className="grid items-start gap-5 lg:grid-cols-[1.25fr_1fr]">
            <AttentionPanel items={summary.data.attention} />
            <ClientDistribution clients={clients.data} />
          </div>
        </>
      )}
    </>
  );
}
