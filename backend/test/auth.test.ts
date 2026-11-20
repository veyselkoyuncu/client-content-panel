import { describe, expect, it } from 'vitest';
import { setupTestApp, TEST_USER } from './helpers.js';

const { app, request } = setupTestApp();

describe('auth', () => {
  it('rejects protected routes without a session', async () => {
    const response = await (await app).inject({ method: 'GET', url: '/api/clients' });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('UNAUTHORIZED');
  });

  it('rejects wrong credentials with a generic error', async () => {
    const response = await (await app).inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: TEST_USER.email, password: 'wrong-password' },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('INVALID_CREDENTIALS');
  });

  it('logs in case-insensitively and sets an httpOnly cookie', async () => {
    const response = await (await app).inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: TEST_USER.email.toUpperCase(), password: TEST_USER.password },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toMatchObject({ email: TEST_USER.email, name: TEST_USER.name });
    expect(String(response.headers['set-cookie'])).toMatch(/HttpOnly/i);
  });

  it('returns the current user and invalidates the session on logout', async () => {
    expect((await request('GET', '/api/auth/me')).body.data.email).toBe(TEST_USER.email);
    expect((await request('POST', '/api/auth/logout')).status).toBe(204);
    expect((await request('GET', '/api/auth/me')).status).toBe(401);
  });
});
