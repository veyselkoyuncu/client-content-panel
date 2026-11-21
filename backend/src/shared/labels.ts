import type { ContentStatus } from '../modules/contents/content.constants.js';

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Taslak',
  in_review: 'Onayda',
  published: 'Yayında',
};
