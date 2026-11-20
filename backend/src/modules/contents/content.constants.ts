export const CONTENT_TYPES = ['social_post', 'blog_post', 'web_page', 'other'] as const;
export const CONTENT_STATUSES = ['draft', 'in_review', 'published'] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
