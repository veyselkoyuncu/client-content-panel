import type { FastifyPluginAsync } from 'fastify';
import { parseIdParam } from '../../shared/schemas.js';
import { parseInput } from '../../shared/validation.js';
import { createClientSchema, listClientsQuerySchema, updateClientSchema } from './client.schemas.js';
import * as clientService from './client.service.js';

const NOT_FOUND = 'Müşteri bulunamadı.';

export const clientRoutes: FastifyPluginAsync = async (app) => {
  app.get('/clients', async (request) => {
    const query = parseInput(listClientsQuerySchema, request.query);
    const clients = await clientService.listClients(app.db, query);
    return { data: clients, meta: { total: clients.length } };
  });

  app.post('/clients', async (request, reply) => {
    const input = parseInput(createClientSchema, request.body);
    const client = await clientService.createClient(app.db, input);
    return reply.status(201).send({ data: client });
  });

  app.get('/clients/:id', async (request) => {
    const id = parseIdParam(request.params, NOT_FOUND);
    return { data: await clientService.getClient(app.db, id) };
  });

  app.patch('/clients/:id', async (request) => {
    const id = parseIdParam(request.params, NOT_FOUND);
    const input = parseInput(updateClientSchema, request.body);
    return { data: await clientService.updateClient(app.db, id, input) };
  });

  app.delete('/clients/:id', async (request, reply) => {
    const id = parseIdParam(request.params, NOT_FOUND);
    await clientService.deleteClient(app.db, id);
    return reply.status(204).send();
  });
};
