import { sql } from 'kysely';
import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_request, reply) => {
    try {
      await sql`SELECT 1`.execute(app.db);
      return { status: 'ok' };
    } catch (error) {
      app.log.error({ err: error }, 'Database health check failed');
      return reply.status(503).send({ status: 'unavailable' });
    }
  });
};
