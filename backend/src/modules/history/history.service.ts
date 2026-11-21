import type { DB } from '../../db/database.js';
import { notFound } from '../../shared/errors.js';
import * as contentRepository from '../contents/content.repository.js';
import * as repository from './history.repository.js';
import type { ActivityQuery } from './history.schemas.js';

function toEventResponse(row: repository.EventRow) {
  return {
    id: row.id,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    createdAt: row.createdAt,
    user: row.userId && row.userName ? { id: row.userId, name: row.userName } : null,
    content: { id: row.contentId, title: row.contentTitle, status: row.contentStatus },
    client: { id: row.clientId, name: row.clientName },
  };
}

export async function getContentHistory(db: DB, contentId: string) {
  const content = await contentRepository.findById(db, contentId);
  if (!content) {
    throw notFound('İçerik bulunamadı.');
  }
  const rows = await repository.listForContent(db, contentId);
  return rows.map(toEventResponse);
}

export async function listActivity(db: DB, { page, pageSize, ...filters }: ActivityQuery) {
  const [rows, total] = await Promise.all([
    repository.listActivity(db, filters, page, pageSize),
    repository.countActivity(db, filters),
  ]);
  return { items: rows.map(toEventResponse), meta: { total, page, pageSize } };
}
