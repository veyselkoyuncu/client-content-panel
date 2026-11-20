import { sql } from 'kysely';
import type { DB } from '../../db/database.js';
import { today } from '../../shared/sql.js';
import { selectContents } from '../contents/content.repository.js';

export function totals(db: DB) {
  return db
    .selectFrom('contents')
    .select((eb) => [
      eb.selectFrom('clients').select(eb.cast<number>(eb.fn.countAll(), 'integer').as('count')).as('totalClients'),
      eb.cast<number>(eb.fn.countAll(), 'integer').as('totalContents'),
      eb.cast<number>(eb.fn.countAll().filterWhere('status', '=', 'draft'), 'integer').as('draft'),
      eb.cast<number>(eb.fn.countAll().filterWhere('status', '=', 'in_review'), 'integer').as('inReview'),
      eb.cast<number>(eb.fn.countAll().filterWhere('status', '=', 'published'), 'integer').as('published'),
      eb
        .cast<number>(
          eb.fn
            .countAll()
            .filterWhere((fb) =>
              fb.and([fb('status', '!=', 'published'), fb('dueDate', 'is not', null), fb('dueDate', '<', today)]),
            ),
          'integer',
        )
        .as('overdue'),
    ])
    .executeTakeFirstOrThrow();
}

export function latestPerStatus(db: DB, limit: number) {
  const ranked = selectContents(db)
    .select(sql<number>`row_number() OVER (PARTITION BY contents.status ORDER BY contents.updated_at DESC)`.as('rank'))
    .as('ranked');

  return db
    .selectFrom(ranked)
    .selectAll()
    .where('rank', '<=', limit)
    .orderBy('updatedAt', 'desc')
    .execute();
}

export function needingAttention(db: DB, daysAhead: number, limit: number) {
  return selectContents(db)
    .where('contents.status', '!=', 'published')
    .where('contents.dueDate', 'is not', null)
    .where(sql<boolean>`contents.due_date <= ${today} + ${daysAhead}::int`)
    .orderBy('contents.dueDate', 'asc')
    .orderBy('contents.updatedAt', 'desc')
    .limit(limit)
    .execute();
}
