import { useQuery } from "@tanstack/react-query";
import type { Content, StatusCounts } from "@/features/contents/types";
import { api, type DataResponse } from "@/lib/api";
import type { ContentStatus } from "@/lib/labels";

export interface DashboardSummary {
  totalClients: number;
  totalContents: number;
  contentsByStatus: StatusCounts;
  overdueCount: number;
  latestByStatus: Record<ContentStatus, Content[]>;
  attention: Content[];
}

export const dashboardKeys = { summary: ["dashboard", "summary"] as const };

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: () => api.get<DataResponse<DashboardSummary>>("/dashboard/summary").then((r) => r.data),
  });
}
