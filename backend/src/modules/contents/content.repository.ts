import { type Expression, type ExpressionBuilder, type SqlBool, sql } from 'kysely';
import type { DB } from '../../db/database.js';
import type { ContentUpdate, Database, NewContent } from '../../db/types.js';
import { containsText, today, turkishOrder } from '../../shared/sql.js';
import type { ContentStatus } from './content.constants.js';
import type { ListContentsQuery } from './content.schemas.js';

type Filters = Omit<ListContentsQuery, 'sort' | 'page' | 'pageSize'>;

function filterBy(eb: ExpressionBuilder<Database, 'contents'>, filters: Filters) {
  const conditions: Expression<SqlBool>[] = [];
  if (filters.status) conditions.push(eb('contents.status', '=', filters.status));
  if (filters.clientId) conditions.push(eb('contents.clientId', '=', filters.clientId));
  if (filters.type) conditions.push(eb('contents.type', '=', filters.type));
  if (filters.q) conditions.push(containsText('contents.title', filters.q));
  return eb.and(conditions);
}

export function selectContents(db: DB) {
  return db
    .selectFrom('contents')
    .innerJoin('clients', 'clients.id', 'contents.clientId')
    .select([
      'contents.id',
      'contents.title',
      'contents.type',
      'contents.status',
      'contents.dueDate',
      'contents.createdAt',
      'contents.updatedAt',
      'clients.id as clientId',
      'clients.name as clientName',
      sql<boolean>`contents.due_date IS NOT NULL AND contents.due_date < ${today} AND contents.status <> 'published'`.as(
        'isOverdue',
      ),
    ]);
}

export type ContentRow = Awaited<ReturnType<ReturnType<typeof selectContents>['execute']>>[number];

function sorted(query: ReturnType<typeof selectContents>, sort: ListContentsQuery['sort']) {
  switch (sort) {
    case 'dueDate':
      return query.orderBy(sql`contents.due_date ASC NULLS LAST`).orderBy('contents.updatedAt', 'desc');
    case '-createdAt':
      return query.orderBy('contents.createdAt', 'desc');
    case 'title':
      return query.orderBy(turkishOrder('contents.title'));
    default:
      return query.orderBy('contents.updatedAt', 'desc');
  }
}

export function list(db: DB, { sort, page, pageSize, ...filters }: ListContentsQuery) {
  const query = sorted(
    selectContents(db).where((eb) => filterBy(eb, filters)),
    sort,
  ).orderBy('contents.id');
  return page ? query.limit(pageSize).offset((page - 1) * pageSize).execute() : query.execute();
}

export async function countByStatus(db: DB, filters: Omit<Filters, 'status'>) {
  const rows = await db
    .selectFrom('contents')
    .select(['contents.status', (eb) => eb.cast<number>(eb.fn.countAll(), 'integer').as('count')])
    .where((eb) => filterBy(eb, filters))
    .groupBy('contents.status')
    .execute();

  const counts: Record<ContentStatus, number> = { draft: 0, in_review: 0, published: 0 };
  for (const row of rows) {
    counts[row.status] = row.count;
  }
  return counts;
}

export function findById(db: DB, id: string) {
  return selectContents(db).select('contents.body').where('contents.id', '=', id).executeTakeFirst();
}

export async function insert(db: DB, values: NewContent) {
  const row = await db.insertInto('contents').values(values).returning('id').executeTakeFirstOrThrow();
  return row.id;
}

export async function update(db: DB, id: string, values: ContentUpdate) {
  const row = await db.updateTable('contents').set(values).where('id', '=', id).returning('id').executeTakeFirst();
  return row !== undefined;
}

export async function remove(db: DB, id: string) {
  const result = await db.deleteFrom('contents').where('id', '=', id).executeTakeFirst();
  return result.numDeletedRows > 0n;
}
