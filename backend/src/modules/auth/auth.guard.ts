import type { FastifyReply, FastifyRequest } from 'fastify';
import { unauthorized } from '../../shared/errors.js';
import { type AuthUser, findUserBySessionToken } from './auth.service.js';

export const SESSION_COOKIE = 'session';

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser | null;
  }
}

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  const token = request.cookies[SESSION_COOKIE];
  const user = token ? await findUserBySessionToken(request.server.db, token) : undefined;
  if (!user) {
    throw unauthorized();
  }
  request.user = user;
}
