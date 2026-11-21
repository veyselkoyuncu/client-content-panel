import { z } from 'zod';
import { notFound } from './errors.js';

export const optionalText = (max: number) =>
  z
    .string({ error: 'Metin olmalıdır.' })
    .trim()
    .max(max, { error: `En fazla ${max} karakter girebilirsiniz.` })
    .nullish()
    .transform((value) => (value ? value : null));

export const optionalUrl = (max: number) =>
  optionalText(max).refine((value) => value === null || z.url({ protocol: /^https?$/ }).safeParse(value).success, {
    error: 'Geçerli bir web adresi girin (https://...).',
  });

export const searchQuery = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((value) => value || undefined);

const idParamSchema = z.object({ id: z.uuid() });

export function parseIdParam(params: unknown, message?: string): string {
  const result = idParamSchema.safeParse(params);
  if (!result.success) {
    throw notFound(message);
  }
  return result.data.id;
}
