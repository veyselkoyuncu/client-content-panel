import type { DB } from '../../db/database.js';
import { containsText } from '../../shared/sql.js';
import type { ContentStatus } from '../contents/content.constants.js';

export interface ActivityFilters {
  clientId?: string;
  status?: ContentStatus;
  q?: string;
}

function selectEvents(db: DB) {
  return db
    .selectFrom('contentStatusEvents as e')
    .innerJoin('contents as c', 'c.id', 'e.contentId')
    .innerJoin('clients as cl', 'cl.id', 'c.clientId')
    .leftJoin('users as u', 'u.id', 'e.userId')
    .select([
      'e.id',
      'e.fromStatus',
      'e.toStatus',
      'e.createdAt',
      'c.id as contentId',
      'c.title as contentTitle',
      'c.status as contentStatus',
      'cl.id as clientId',
      'cl.name as clientName',
      'u.id as userId',
      'u.name as userName',
    ]);
}

export type EventRow = Awaited<ReturnType<ReturnType<typeof selectEvents>['execute']>>[number];

export function listForContent(db: DB, contentId: string) {
  return selectEvents(db).where('e.contentId', '=', contentId).orderBy('e.createdAt', 'desc').orderBy('e.id').execute();
}

function filtered(db: DB, filters: ActivityFilters) {
  let query = selectEvents(db);
  if (filters.clientId) query = query.where('cl.id', '=', filters.clientId);
  if (filters.status) query = query.where('e.toStatus', '=', filters.status);
  if (filters.q) query = query.where(containsText('c.title', filters.q));
  return query;
}

export function listActivity(db: DB, filters: ActivityFilters, page: number, pageSize: number) {
  return filtered(db, filters)
    .orderBy('e.createdAt', 'desc')
    .orderBy('e.id')
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .execute();
}

export async function countActivity(db: DB, filters: ActivityFilters) {
  let query = db
    .selectFrom('contentStatusEvents as e')
    .innerJoin('contents as c', 'c.id', 'e.contentId')
    .select((eb) => eb.cast<number>(eb.fn.countAll(), 'integer').as('count'));
  if (filters.clientId) query = query.where('c.clientId', '=', filters.clientId);
  if (filters.status) query = query.where('e.toStatus', '=', filters.status);
  if (filters.q) query = query.where(containsText('c.title', filters.q));
  const row = await query.executeTakeFirstOrThrow();
  return row.count;
}
