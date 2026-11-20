import type { DB } from '../../db/database.js';
import type { ContentStatus } from '../contents/content.constants.js';
import { toContentResponse } from '../contents/content.mapper.js';
import * as repository from './dashboard.repository.js';

const LATEST_PER_STATUS = 2;
const ATTENTION_DAYS_AHEAD = 2;
const ATTENTION_LIMIT = 6;

export async function getSummary(db: DB) {
  const [totals, latest, attention] = await Promise.all([
    repository.totals(db),
    repository.latestPerStatus(db, LATEST_PER_STATUS),
    repository.needingAttention(db, ATTENTION_DAYS_AHEAD, ATTENTION_LIMIT),
  ]);

  const latestByStatus: Record<ContentStatus, ReturnType<typeof toContentResponse>[]> = {
    draft: [],
    in_review: [],
    published: [],
  };
  for (const { rank: _rank, ...row } of latest) {
    latestByStatus[row.status].push(toContentResponse(row));
  }

  return {
    totalClients: totals.totalClients ?? 0,
    totalContents: totals.totalContents,
    contentsByStatus: {
      draft: totals.draft,
      in_review: totals.inReview,
      published: totals.published,
    },
    overdueCount: totals.overdue,
    latestByStatus,
    attention: attention.map(toContentResponse),
  };
}
