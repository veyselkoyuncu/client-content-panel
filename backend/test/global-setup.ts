import { Migrator } from 'kysely/migration';
import pg from 'pg';
import { createDatabase } from '../src/db/database.js';
import { migrations } from '../src/db/migrations/index.js';

export default async function setup() {
  const url = new URL(process.env.TEST_DATABASE_URL!);
  const databaseName = url.pathname.slice(1);

  const adminUrl = new URL(url);
  adminUrl.pathname = '/postgres';
  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`);
  await admin.query(`CREATE DATABASE "${databaseName}"`);
  await admin.end();

  const db = createDatabase(url.toString());
  const { error } = await new Migrator({ db, provider: { getMigrations: async () => migrations } }).migrateToLatest();
  await db.destroy();
  if (error) {
    throw error;
  }
}
