import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';
import { createDatabase } from './db/database.js';

const env = loadEnv();
const db = createDatabase(env.DATABASE_URL);
const app = await buildApp({ env, db });

const shutdown = async (signal: string) => {
  app.log.info(`${signal} received, shutting down`);
  await app.close();
  await db.destroy();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.error(error);
  await db.destroy();
  process.exit(1);
}
