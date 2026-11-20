import { Migrator } from 'kysely/migration';
import { loadEnv } from '../config/env.js';
import { createDatabase } from './database.js';
import { migrations } from './migrations/index.js';

async function main() {
  const env = loadEnv();
  const db = createDatabase(env.DATABASE_URL);
  const migrator = new Migrator({
    db,
    provider: { getMigrations: async () => migrations },
  });

  const { error, results } = await migrator.migrateToLatest();

  for (const result of results ?? []) {
    console.log(`${result.status.padEnd(8)} ${result.migrationName}`);
  }
  if (results?.length === 0) {
    console.log('Database is up to date.');
  }

  await db.destroy();

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

await main();
