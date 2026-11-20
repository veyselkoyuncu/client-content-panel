import type { Migration } from 'kysely/migration';
import * as initialSchema from './001_initial_schema.js';

export const migrations: Record<string, Migration> = {
  '001_initial_schema': initialSchema,
};
