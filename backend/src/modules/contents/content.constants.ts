export const CONTENT_TYPES = ['social_post', 'blog_post', 'web_page', 'other'] as const;
export const CONTENT_STATUSES = ['draft', 'in_review', 'published'] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const INITIAL_STATUSES: readonly ContentStatus[] = ['draft', 'in_review'];

export const ALLOWED_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  draft: ['in_review'],
  in_review: ['draft', 'published'],
  published: [],
};

export const canTransition = (from: ContentStatus, to: ContentStatus) => ALLOWED_TRANSITIONS[from].includes(to);
