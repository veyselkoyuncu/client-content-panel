import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { parseInput } from '../../shared/validation.js';
import { requireAuth, SESSION_COOKIE } from './auth.guard.js';
import * as authService from './auth.service.js';

const loginSchema = z.object({
  email: z.email({ error: 'Geçerli bir e-posta adresi girin.' }).trim(),
  password: z.string({ error: 'Şifre zorunludur.' }).min(1, { error: 'Şifre zorunludur.' }),
});

export const authRoutes: FastifyPluginAsync<{ secureCookies: boolean }> = async (app, { secureCookies }) => {
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookies,
  } as const;

  app.post('/auth/login', async (request, reply) => {
    const { email, password } = parseInput(loginSchema, request.body);
    const { user, token, expiresAt } = await authService.login(app.db, email, password);
    reply.setCookie(SESSION_COOKIE, token, { ...cookieOptions, expires: expiresAt });
    return { data: user };
  });

  app.post('/auth/logout', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];
    if (token) {
      await authService.logout(app.db, token);
    }
    reply.clearCookie(SESSION_COOKIE, cookieOptions);
    return reply.status(204).send();
  });

  app.get('/auth/me', { preHandler: requireAuth }, async (request) => ({ data: request.user }));
};
