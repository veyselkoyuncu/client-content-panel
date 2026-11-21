import { z } from 'zod';
import { optionalText, optionalUrl, searchQuery } from '../../shared/schemas.js';
import { CONTENT_STATUSES, CONTENT_TYPES } from './content.constants.js';

const clientId = z.uuid({ error: 'Müşteri seçin.' });

const title = z
  .string({ error: 'Başlık zorunludur.' })
  .trim()
  .min(3, { error: 'Başlık en az 3 karakter olmalıdır.' })
  .max(200, { error: 'Başlık en fazla 200 karakter olabilir.' });

const type = z.enum(CONTENT_TYPES, { error: 'Geçerli bir içerik türü seçin.' });
const status = z.enum(CONTENT_STATUSES, { error: 'Geçerli bir durum seçin.' });

const dueDate = z.iso
  .date({ error: 'Geçerli bir tarih girin (YYYY-AA-GG).' })
  .nullish()
  .transform((value) => value ?? null);

export const createContentSchema = z.object({
  clientId,
  title,
  type,
  status: status.default('draft'),
  body: optionalText(10000),
  link: optionalUrl(2048),
  dueDate,
});

export const updateContentSchema = z
  .object({ clientId, title, type, status, body: optionalText(10000), link: optionalUrl(2048), dueDate })
  .partial();

export const updateStatusSchema = z.object({ status });

export const CONTENT_SORTS = ['dueDate', '-updatedAt', '-createdAt', 'title'] as const;

export const listContentsQuerySchema = z.object({
  status: status.optional(),
  clientId: z.uuid({ error: 'Geçersiz müşteri.' }).optional(),
  type: type.optional(),
  q: searchQuery,
  sort: z.enum(CONTENT_SORTS, { error: 'Geçersiz sıralama.' }).default('-updatedAt'),
  page: z.coerce.number({ error: 'Geçersiz sayfa.' }).int().min(1, { error: 'Geçersiz sayfa.' }).optional(),
  pageSize: z.coerce
    .number({ error: 'Geçersiz sayfa boyutu.' })
    .int()
    .min(1, { error: 'Geçersiz sayfa boyutu.' })
    .max(100, { error: 'Sayfa boyutu en fazla 100 olabilir.' })
    .default(20),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type ListContentsQuery = z.infer<typeof listContentsQuerySchema>;
