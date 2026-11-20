import type { ExpressionBuilder } from 'kysely';
import type { DB } from '../../db/database.js';
import type { ClientUpdate, Database, NewClient } from '../../db/types.js';
import { containsText, turkishOrder } from '../../shared/sql.js';
import type { ContentStatus } from '../contents/content.constants.js';

type Builder = ExpressionBuilder<Database & { c: Database['contents'] }, 'clients' | 'c'>;

const countByStatus = (eb: Builder, status: ContentStatus) =>
  eb.cast<number>(eb.fn.count('c.id').filterWhere('c.status', '=', status), 'integer');

function selectWithStats(db: DB) {
  return db
    .selectFrom('clients')
    .leftJoin('contents as c', 'c.clientId', 'clients.id')
    .groupBy('clients.id')
    .selectAll('clients')
    .select((eb) => [
      eb.cast<number>(eb.fn.count('c.id'), 'integer').as('contentCount'),
      countByStatus(eb, 'draft').as('draftCount'),
      countByStatus(eb, 'in_review').as('inReviewCount'),
      countByStatus(eb, 'published').as('publishedCount'),
      eb.fn.min('c.dueDate').filterWhere('c.status', '!=', 'published').as('nextDueDate'),
    ]);
}

export function list(db: DB, search?: string) {
  const query = selectWithStats(db).orderBy(turkishOrder('clients.name'));
  return (search ? query.where(containsText('clients.name', search)) : query).execute();
}

export function findById(db: DB, id: string) {
  return selectWithStats(db).where('clients.id', '=', id).executeTakeFirst();
}

export function insert(db: DB, values: NewClient) {
  return db.insertInto('clients').values(values).returningAll().executeTakeFirstOrThrow();
}

export function update(db: DB, id: string, values: ClientUpdate) {
  return db.updateTable('clients').set(values).where('id', '=', id).returningAll().executeTakeFirst();
}

export async function remove(db: DB, id: string) {
  const result = await db.deleteFrom('clients').where('id', '=', id).executeTakeFirst();
  return result.numDeletedRows > 0n;
}

export async function countContents(db: DB, clientId: string) {
  const row = await db
    .selectFrom('contents')
    .select((eb) => eb.cast<number>(eb.fn.countAll(), 'integer').as('count'))
    .where('clientId', '=', clientId)
    .executeTakeFirstOrThrow();
  return row.count;
}
