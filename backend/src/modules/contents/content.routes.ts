import type { FastifyPluginAsync } from 'fastify';
import { parseIdParam } from '../../shared/schemas.js';
import { parseInput } from '../../shared/validation.js';
import {
  createContentSchema,
  listContentsQuerySchema,
  updateContentSchema,
  updateStatusSchema,
} from './content.schemas.js';
import * as contentService from './content.service.js';

const NOT_FOUND = 'İçerik bulunamadı.';

export const contentRoutes: FastifyPluginAsync = async (app) => {
  app.get('/contents', async (request) => {
    const query = parseInput(listContentsQuerySchema, request.query);
    const { items, statusCounts } = await contentService.listContents(app.db, query);
    return { data: items, meta: { total: items.length, statusCounts } };
  });

  app.post('/contents', async (request, reply) => {
    const input = parseInput(createContentSchema, request.body);
    return reply.status(201).send({ data: await contentService.createContent(app.db, input) });
  });

  app.get('/contents/:id', async (request) => {
    const id = parseIdParam(request.params, NOT_FOUND);
    return { data: await contentService.getContent(app.db, id) };
  });

  app.patch('/contents/:id', async (request) => {
    const id = parseIdParam(request.params, NOT_FOUND);
    const input = parseInput(updateContentSchema, request.body);
    return { data: await contentService.updateContent(app.db, id, input) };
  });

  app.patch('/contents/:id/status', async (request) => {
    const id = parseIdParam(request.params, NOT_FOUND);
    const { status } = parseInput(updateStatusSchema, request.body);
    return { data: await contentService.updateContentStatus(app.db, id, status) };
  });

  app.delete('/contents/:id', async (request, reply) => {
    const id = parseIdParam(request.params, NOT_FOUND);
    await contentService.deleteContent(app.db, id);
    return reply.status(204).send();
  });
};
