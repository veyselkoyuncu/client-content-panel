import cors from '@fastify/cors';
import Fastify, { type FastifyServerOptions } from 'fastify';
import type { Env } from './config/env.js';
import type { DB } from './db/database.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { registerErrorHandling } from './shared/error-handler.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: DB;
  }
}

export interface AppDependencies {
  env: Env;
  db: DB;
  logger?: FastifyServerOptions['logger'];
}

export async function buildApp({ env, db, logger = true }: AppDependencies) {
  const app = Fastify({ logger, trustProxy: true });

  app.decorate('db', db);
  registerErrorHandling(app);

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  await app.register(
    async (api) => {
      await api.register(healthRoutes);
    },
    { prefix: '/api' },
  );

  return app;
}
