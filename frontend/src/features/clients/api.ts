import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type DataResponse } from "@/lib/api";

export interface Client {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  contentCount: number;
  draftCount: number;
  inReviewCount: number;
  publishedCount: number;
  nextDueDate: string | null;
}

export type ClientInput = Pick<Client, "name" | "contactName" | "email" | "phone" | "website" | "industry" | "notes">;

export const clientKeys = {
  all: ["clients"] as const,
  list: (q?: string) => ["clients", "list", q ?? ""] as const,
  detail: (id: string) => ["clients", "detail", id] as const,
};

export function useClients(q?: string) {
  return useQuery({
    queryKey: clientKeys.list(q),
    queryFn: () =>
      api.get<DataResponse<Client[]>>(`/clients${q ? `?q=${encodeURIComponent(q)}` : ""}`).then((r) => r.data),
    placeholderData: (previous) => previous,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => api.get<DataResponse<Client>>(`/clients/${id}`).then((r) => r.data),
  });
}

export function useSaveClient(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) =>
      (id
        ? api.patch<DataResponse<Client>>(`/clients/${id}`, input)
        : api.post<DataResponse<Client>>("/clients", input)
      ).then((r) => r.data),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clientKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["contents"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clientKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]),
  });
}
