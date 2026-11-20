import { useQuery } from "@tanstack/react-query";
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
  });
}
