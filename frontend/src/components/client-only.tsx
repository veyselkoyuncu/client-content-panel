"use client";

import type { ReactNode } from "react";
import { useIsClient } from "@/lib/use-is-client";

export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return useIsClient() ? children : fallback;
}
