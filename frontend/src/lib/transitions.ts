import type { ContentStatus } from "./labels";

export const INITIAL_STATUSES: readonly ContentStatus[] = ["draft", "in_review"];

export const ALLOWED_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  draft: ["in_review"],
  in_review: ["draft", "published"],
  published: [],
};

export const canTransition = (from: ContentStatus, to: ContentStatus) => ALLOWED_TRANSITIONS[from].includes(to);

export const isLocked = (status: ContentStatus) => status === "published";
