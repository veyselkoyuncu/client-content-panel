import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import Fastify, { type FastifyServerOptions } from 'fastify';
import type { Env } from './config/env.js';
import type { DB } from './db/database.js';
import { requireAuth } from './modules/auth/auth.guard.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { clientRoutes } from './modules/clients/client.routes.js';
import { contentRoutes } from './modules/contents/content.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
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
  app.decorateRequest('user', null);
  registerErrorHandling(app);

  app.removeContentTypeParser('application/json');
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_request, body, done) => {
    if (body === '') {
      return done(null, undefined);
    }
    try {
      done(null, JSON.parse(body as string));
    } catch {
      done(Object.assign(new Error('Invalid JSON body'), { statusCode: 400 }), undefined);
    }
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  await app.register(cookie);

  await app.register(
    async (api) => {
      await api.register(healthRoutes);
      await api.register(authRoutes, { secureCookies: env.NODE_ENV === 'production' });

      await api.register(async (protectedApi) => {
        protectedApi.addHook('preHandler', requireAuth);
        await protectedApi.register(clientRoutes);
        await protectedApi.register(contentRoutes);
        await protectedApi.register(dashboardRoutes);
      });
    },
    { prefix: '/api' },
  );

  return app;
}
