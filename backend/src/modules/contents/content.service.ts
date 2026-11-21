import type { DB } from '../../db/database.js';
import { isForeignKeyViolation } from '../../shared/db-errors.js';
import { conflict, notFound, validationError } from '../../shared/errors.js';
import { STATUS_LABELS } from '../../shared/labels.js';
import { type ContentStatus, canTransition, INITIAL_STATUSES } from './content.constants.js';
import { toContentResponse } from './content.mapper.js';
import * as repository from './content.repository.js';
import type { CreateContentInput, ListContentsQuery, UpdateContentInput } from './content.schemas.js';

const CONTENT_NOT_FOUND = 'İçerik bulunamadı.';

const clientMissing = () => validationError([{ field: 'clientId', message: 'Seçilen müşteri bulunamadı.' }]);

const locked = () =>
  conflict('CONTENT_LOCKED', 'Yayındaki içerik düzenlenemez. Değişiklik için önce yayından kaldırın.');

const invalidTransition = (from: ContentStatus, to: ContentStatus) =>
  conflict(
    'INVALID_TRANSITION',
    `${STATUS_LABELS[from]} durumundaki içerik ${STATUS_LABELS[to]} durumuna taşınamaz.`,
  );

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

async function lockStatus(trx: DB, id: string) {
  const status = await repository.findStatusForUpdate(trx, id);
  if (!status) {
    throw notFound(CONTENT_NOT_FOUND);
  }
  return status;
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

export async function createContent(db: DB, input: CreateContentInput, userId: string) {
  if (!INITIAL_STATUSES.includes(input.status)) {
    throw validationError([{ field: 'status', message: 'Yeni içerik Taslak veya Onayda olarak oluşturulabilir.' }]);
  }
  const id = await withClientCheck(() =>
    db.transaction().execute(async (trx) => {
      const contentId = await repository.insert(trx, input);
      await repository.insertStatusEvent(trx, { contentId, fromStatus: null, toStatus: input.status, userId });
      return contentId;
    }),
  );
  return getContent(db, id);
}

export async function updateContent(db: DB, id: string, input: UpdateContentInput, userId: string) {
  await withClientCheck(() =>
    db.transaction().execute(async (trx) => {
      const current = await lockStatus(trx, id);
      if (current === 'published') {
        throw locked();
      }
      const next = input.status;
      if (next && next !== current && !canTransition(current, next)) {
        throw invalidTransition(current, next);
      }
      await repository.update(trx, id, input);
      if (next && next !== current) {
        await repository.insertStatusEvent(trx, { contentId: id, fromStatus: current, toStatus: next, userId });
      }
    }),
  );
  return getContent(db, id);
}

export async function updateContentStatus(db: DB, id: string, status: ContentStatus, userId: string) {
  await db.transaction().execute(async (trx) => {
    const current = await lockStatus(trx, id);
    if (current === status) {
      return;
    }
    if (!canTransition(current, status)) {
      throw invalidTransition(current, status);
    }
    await repository.update(trx, id, { status });
    await repository.insertStatusEvent(trx, { contentId: id, fromStatus: current, toStatus: status, userId });
  });
  return getContent(db, id);
}

export async function unpublishContent(db: DB, id: string, userId: string) {
  await db.transaction().execute(async (trx) => {
    const current = await lockStatus(trx, id);
    if (current !== 'published') {
      throw conflict('INVALID_TRANSITION', 'Yalnızca yayındaki içerik yayından kaldırılabilir.');
    }
    await repository.update(trx, id, { status: 'draft' });
    await repository.insertStatusEvent(trx, { contentId: id, fromStatus: 'published', toStatus: 'draft', userId });
  });
  return getContent(db, id);
}

export async function deleteContent(db: DB, id: string) {
  await db.transaction().execute(async (trx) => {
    const current = await lockStatus(trx, id);
    if (current === 'published') {
      throw locked();
    }
    await repository.remove(trx, id);
  });
}
