export const CONTENT_STATUSES = ["draft", "in_review", "published"] as const;
export const CONTENT_TYPES = ["social_post", "blog_post", "web_page", "other"] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Taslak",
  in_review: "Onayda",
  published: "Yayında",
};

export const TYPE_LABELS: Record<ContentType, string> = {
  social_post: "Sosyal medya gönderisi",
  blog_post: "Blog yazısı",
  web_page: "Web sayfası",
  other: "Diğer",
};

export const STATUS_STYLES: Record<ContentStatus, { dot: string; badge: string; panel: string }> = {
  draft: { dot: "bg-draft", badge: "bg-draft-bg text-draft-fg", panel: "bg-draft-bg" },
  in_review: { dot: "bg-review", badge: "bg-review-bg text-review-fg", panel: "bg-review-bg" },
  published: { dot: "bg-published", badge: "bg-published-bg text-published-fg", panel: "bg-published-bg" },
};
