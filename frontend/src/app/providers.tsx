"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";

function createQueryClient(onUnauthorized: () => void) {
  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      onUnauthorized();
    }
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(() =>
    createQueryClient(() => {
      if (window.location.pathname !== "/login") {
        router.replace("/login");
      }
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
