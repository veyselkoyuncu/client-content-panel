import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from './types.js';

export type DB = Kysely<Database>;

export function createDatabase(connectionString: string): DB {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString, max: 10 }),
    }),
    plugins: [new CamelCasePlugin()],
  });
}
