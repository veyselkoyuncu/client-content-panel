import type { FastifyPluginAsync } from 'fastify';
import { getSummary } from './dashboard.service.js';

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get('/dashboard/summary', async () => ({ data: await getSummary(app.db) }));
};
