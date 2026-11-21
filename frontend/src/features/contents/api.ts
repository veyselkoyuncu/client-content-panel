import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/features/clients/api";
import { dashboardKeys } from "@/features/dashboard/api";
import { api, type DataResponse } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { type ContentStatus, type ContentType, STATUS_LABELS } from "@/lib/labels";
import type { Content, StatusCounts } from "./types";

export interface ContentFilters {
  status?: ContentStatus;
  clientId?: string;
  type?: ContentType;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface ContentInput {
  clientId: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  dueDate: string | null;
  body: string | null;
  link: string | null;
}

interface ContentListResponse {
  data: Content[];
  meta: { total: number; page?: number; pageSize?: number; statusCounts: StatusCounts };
}

export const contentKeys = {
  all: ["contents"] as const,
  list: (filters: ContentFilters) => ["contents", "list", filters] as const,
  detail: (id: string) => ["contents", "detail", id] as const,
};

function toQuery(filters: ContentFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function useContents(filters: ContentFilters) {
  return useQuery({
    queryKey: contentKeys.list(filters),
    queryFn: () => api.get<ContentListResponse>(`/contents${toQuery(filters)}`),
    placeholderData: (previous) => previous,
  });
}

export function useContent(id: string | undefined) {
  return useQuery({
    queryKey: contentKeys.detail(id ?? ""),
    queryFn: () => api.get<DataResponse<Content>>(`/contents/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

function invalidateRelated(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: contentKeys.all }),
    queryClient.invalidateQueries({ queryKey: clientKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.summary }),
  ]);
}

export function useSaveContent(id?: string) {
  const queryClient = useQueryClient();
  const notify = useToast();
  return useMutation({
    mutationFn: (input: ContentInput) =>
      (id
        ? api.patch<DataResponse<Content>>(`/contents/${id}`, input)
        : api.post<DataResponse<Content>>("/contents", input)
      ).then((r) => r.data),
    onSuccess: (content) => {
      notify(
        id ? `"${content.title}" güncellendi.` : `"${content.title}" oluşturuldu.`,
        id ? "info" : "success",
      );
      return invalidateRelated(queryClient);
    },
  });
}

export function useUpdateContentStatus() {
  const queryClient = useQueryClient();
  const notify = useToast();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatus }) =>
      api.patch<DataResponse<Content>>(`/contents/${id}/status`, { status }).then((r) => r.data),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: contentKeys.all });
      const snapshots = queryClient.getQueriesData<ContentListResponse>({ queryKey: ["contents", "list"] });
      for (const [key, value] of snapshots) {
        if (!value) continue;
        queryClient.setQueryData<ContentListResponse>(key, {
          ...value,
          data: value.data.map((content) => (content.id === id ? { ...content, status } : content)),
        });
      }
      return { snapshots };
    },
    onSuccess: (content) =>
      notify(`"${content.title}" ${STATUS_LABELS[content.status]} durumuna taşındı.`, content.status),
    onError: (error, _variables, context) => {
      notify(error.message, "error");
      for (const [key, value] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, value);
      }
    },
    onSettled: () => invalidateRelated(queryClient),
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  const notify = useToast();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/contents/${id}`),
    onSuccess: () => {
      notify("İçerik silindi.", "danger");
      return invalidateRelated(queryClient);
    },
  });
}
