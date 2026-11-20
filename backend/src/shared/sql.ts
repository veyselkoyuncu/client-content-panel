import { sql } from 'kysely';

export const BUSINESS_TIME_ZONE = 'Europe/Istanbul';

export const today = sql<string>`(now() AT TIME ZONE ${sql.lit(BUSINESS_TIME_ZONE)})::date`;

const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

export const containsText = (column: string, search: string) =>
  sql<boolean>`lower(${sql.ref(column)} COLLATE "tr-x-icu") LIKE '%' || lower(${escapeLike(search)} COLLATE "tr-x-icu") || '%'`;

export const turkishOrder = (column: string) => sql`${sql.ref(column)} COLLATE "tr-x-icu"`;
