import { useQuery } from "@tanstack/react-query";
import { api, type DataResponse } from "@/lib/api";
import type { ContentStatus } from "@/lib/labels";

export interface StatusEvent {
  id: string;
  fromStatus: ContentStatus | null;
  toStatus: ContentStatus;
  createdAt: string;
  user: { id: string; name: string } | null;
  content: { id: string; title: string; status: ContentStatus };
  client: { id: string; name: string };
}

export interface ActivityFilters {
  clientId?: string;
  status?: ContentStatus;
  q?: string;
  page: number;
  pageSize: number;
}

interface ActivityResponse {
  data: StatusEvent[];
  meta: { total: number; page: number; pageSize: number };
}

export const activityKeys = {
  all: ["activity"] as const,
  content: (id: string) => ["activity", "content", id] as const,
  list: (filters: ActivityFilters) => ["activity", "list", filters] as const,
};

export function useContentHistory(contentId: string | undefined) {
  return useQuery({
    queryKey: activityKeys.content(contentId ?? ""),
    queryFn: () => api.get<DataResponse<StatusEvent[]>>(`/contents/${contentId}/history`).then((r) => r.data),
    enabled: Boolean(contentId),
  });
}

export function useActivity(filters: ActivityFilters) {
  const params = new URLSearchParams({ page: String(filters.page), pageSize: String(filters.pageSize) });
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.status) params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => api.get<ActivityResponse>(`/activity?${params}`),
    placeholderData: (previous) => previous,
  });
}
