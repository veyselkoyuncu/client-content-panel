import { sql } from 'kysely';
import type { DB } from '../../db/database.js';

export function findUserByEmail(db: DB, email: string) {
  return db
    .selectFrom('users')
    .selectAll()
    .where(sql<string>`lower(email)`, '=', email.toLowerCase())
    .executeTakeFirst();
}

export async function createSession(db: DB, userId: string, tokenHash: string, expiresAt: Date) {
  await db.deleteFrom('sessions').where('userId', '=', userId).where('expiresAt', '<=', new Date()).execute();
  await db.insertInto('sessions').values({ userId, tokenHash, expiresAt }).execute();
}

export function findUserBySessionHash(db: DB, tokenHash: string) {
  return db
    .selectFrom('sessions')
    .innerJoin('users', 'users.id', 'sessions.userId')
    .select(['users.id', 'users.email', 'users.name'])
    .where('sessions.tokenHash', '=', tokenHash)
    .where('sessions.expiresAt', '>', new Date())
    .executeTakeFirst();
}

export async function deleteSession(db: DB, tokenHash: string) {
  await db.deleteFrom('sessions').where('tokenHash', '=', tokenHash).execute();
}
