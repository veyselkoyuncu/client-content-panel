import type { DB } from '../../db/database.js';
import { isForeignKeyViolation } from '../../shared/db-errors.js';
import { notFound, validationError } from '../../shared/errors.js';
import type { ContentStatus } from './content.constants.js';
import { toContentResponse } from './content.mapper.js';
import * as repository from './content.repository.js';
import type { CreateContentInput, ListContentsQuery, UpdateContentInput } from './content.schemas.js';

const CONTENT_NOT_FOUND = 'İçerik bulunamadı.';

const clientMissing = () => validationError([{ field: 'clientId', message: 'Seçilen müşteri bulunamadı.' }]);

async function withClientCheck<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw clientMissing();
    }
    throw error;
  }
}

export async function listContents(db: DB, query: ListContentsQuery) {
  const [rows, statusCounts] = await Promise.all([
    repository.list(db, query),
    repository.countByStatus(db, { clientId: query.clientId, type: query.type, q: query.q }),
  ]);
  const total = query.status
    ? statusCounts[query.status]
    : statusCounts.draft + statusCounts.in_review + statusCounts.published;
  const pagination = query.page ? { page: query.page, pageSize: query.pageSize } : {};
  return { items: rows.map(toContentResponse), meta: { total, ...pagination, statusCounts } };
}

export async function getContent(db: DB, id: string) {
  const row = await repository.findById(db, id);
  if (!row) {
    throw notFound(CONTENT_NOT_FOUND);
  }
  return toContentResponse(row);
}

export async function createContent(db: DB, input: CreateContentInput) {
  const id = await withClientCheck(() => repository.insert(db, input));
  return getContent(db, id);
}

export async function updateContent(db: DB, id: string, input: UpdateContentInput) {
  const updated = await withClientCheck(() => repository.update(db, id, input));
  if (!updated) {
    throw notFound(CONTENT_NOT_FOUND);
  }
  return getContent(db, id);
}

export function updateContentStatus(db: DB, id: string, status: ContentStatus) {
  return updateContent(db, id, { status });
}

export async function deleteContent(db: DB, id: string) {
  const deleted = await repository.remove(db, id);
  if (!deleted) {
    throw notFound(CONTENT_NOT_FOUND);
  }
}
