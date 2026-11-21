import { z } from 'zod';
import { searchQuery } from '../../shared/schemas.js';
import { CONTENT_STATUSES } from '../contents/content.constants.js';

export const activityQuerySchema = z.object({
  clientId: z.uuid({ error: 'Geçersiz müşteri.' }).optional(),
  status: z.enum(CONTENT_STATUSES, { error: 'Geçerli bir durum seçin.' }).optional(),
  q: searchQuery,
  page: z.coerce.number({ error: 'Geçersiz sayfa.' }).int().min(1, { error: 'Geçersiz sayfa.' }).default(1),
  pageSize: z.coerce
    .number({ error: 'Geçersiz sayfa boyutu.' })
    .int()
    .min(1, { error: 'Geçersiz sayfa boyutu.' })
    .max(100, { error: 'Sayfa boyutu en fazla 100 olabilir.' })
    .default(20),
});

export type ActivityQuery = z.infer<typeof activityQuerySchema>;
