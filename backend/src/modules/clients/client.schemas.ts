import { z } from 'zod';
import { optionalText, searchQuery } from '../../shared/schemas.js';

const name = z
  .string({ error: 'Müşteri adı zorunludur.' })
  .trim()
  .min(2, { error: 'Müşteri adı en az 2 karakter olmalıdır.' })
  .max(120, { error: 'Müşteri adı en fazla 120 karakter olabilir.' });

const email = optionalText(254).refine((value) => value === null || z.email().safeParse(value).success, {
  error: 'Geçerli bir e-posta adresi girin.',
});

const phone = optionalText(30).refine((value) => value === null || /^\+?[\d\s()-]{7,}$/.test(value), {
  error: 'Geçerli bir telefon numarası girin.',
});

const website = optionalText(255).refine(
  (value) => value === null || z.url({ protocol: /^https?$/ }).safeParse(value).success,
  { error: 'Geçerli bir web adresi girin (https://...).' },
);

export const createClientSchema = z.object({
  name,
  contactName: optionalText(120),
  email,
  phone,
  website,
  industry: optionalText(80),
  notes: optionalText(2000),
});

export const updateClientSchema = createClientSchema.partial();

export const listClientsQuerySchema = z.object({
  q: searchQuery,
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
