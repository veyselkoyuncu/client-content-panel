import { createHash, randomBytes } from 'node:crypto';
import type { DB } from '../../db/database.js';
import { AppError } from '../../shared/errors.js';
import * as repository from './auth.repository.js';
import { hashPassword, verifyPassword } from './password.js';

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

const placeholderHash = hashPassword(randomBytes(16).toString('hex'));

export async function login(db: DB, email: string, password: string) {
  const user = await repository.findUserByEmail(db, email);
  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? (await placeholderHash));

  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'E-posta adresi veya şifre hatalı.');
  }

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await repository.createSession(db, user.id, hashToken(token), expiresAt);

  const authUser: AuthUser = { id: user.id, email: user.email, name: user.name };
  return { user: authUser, token, expiresAt };
}

export async function logout(db: DB, token: string) {
  await repository.deleteSession(db, hashToken(token));
}

export async function findUserBySessionToken(db: DB, token: string): Promise<AuthUser | undefined> {
  return repository.findUserBySessionHash(db, hashToken(token));
}
