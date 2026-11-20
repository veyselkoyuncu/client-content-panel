import { sql } from 'kysely';
import { afterAll, beforeEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { createDatabase } from '../src/db/database.js';
import { hashPassword } from '../src/modules/auth/password.js';

export const TEST_USER = { email: 'test@panel.local', password: 'test-password', name: 'Test Kullanıcı' };

export function setupTestApp() {
  const db = createDatabase(process.env.TEST_DATABASE_URL!);
  const appPromise = buildApp({
    db,
    logger: false,
    env: {
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: 0,
      DATABASE_URL: process.env.TEST_DATABASE_URL!,
      CORS_ORIGIN: 'http://localhost:3000',
    },
  });

  let cookie = '';

  beforeEach(async () => {
    await sql`TRUNCATE contents, clients, sessions, users RESTART IDENTITY CASCADE`.execute(db);
    await db
      .insertInto('users')
      .values({ email: TEST_USER.email, name: TEST_USER.name, passwordHash: await hashPassword(TEST_USER.password) })
      .execute();
    const app = await appPromise;
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: TEST_USER.email, password: TEST_USER.password },
    });
    cookie = String(response.headers['set-cookie']).split(';')[0]!;
  });

  afterAll(async () => {
    await (await appPromise).close();
    await db.destroy();
  });

  async function request(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, payload?: object) {
    const app = await appPromise;
    const response = await app.inject({ method, url, payload, headers: { cookie } });
    return { status: response.statusCode, body: response.body ? response.json() : undefined };
  }

  async function createClient(name: string, extra: object = {}) {
    const { body } = await request('POST', '/api/clients', { name, ...extra });
    return body.data as { id: string; name: string };
  }

  async function createContent(clientId: string, extra: object = {}) {
    const { body } = await request('POST', '/api/contents', {
      clientId,
      title: 'Örnek içerik',
      type: 'blog_post',
      ...extra,
    });
    return body.data as { id: string; status: string };
  }

  return { db, app: appPromise, request, createClient, createContent };
}
