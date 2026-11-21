import type { FastifyPluginAsync } from 'fastify';
import { parseIdParam } from '../../shared/schemas.js';
import { parseInput } from '../../shared/validation.js';
import { activityQuerySchema } from './history.schemas.js';
import * as historyService from './history.service.js';

export const historyRoutes: FastifyPluginAsync = async (app) => {
  app.get('/contents/:id/history', async (request) => {
    const id = parseIdParam(request.params, 'İçerik bulunamadı.');
    return { data: await historyService.getContentHistory(app.db, id) };
  });

  app.get('/activity', async (request) => {
    const query = parseInput(activityQuerySchema, request.query);
    const { items, meta } = await historyService.listActivity(app.db, query);
    return { data: items, meta };
  });
};
