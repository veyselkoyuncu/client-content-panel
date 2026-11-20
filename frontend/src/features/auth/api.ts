import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, type DataResponse } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
}

export const authKeys = { me: ["auth", "me"] as const };

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<DataResponse<User>>("/auth/me").then((response) => response.data),
    staleTime: Infinity,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post<DataResponse<User>>("/auth/login", credentials).then((response) => response.data),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      router.replace("/");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSettled: () => {
      router.replace("/login");
      queryClient.clear();
    },
  });
}
