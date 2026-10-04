// Session authentication. Passwords are hashed with scrypt (Node crypto) and
// compared in constant time. Sessions are random 256-bit tokens in an httpOnly
// cookie. No conversation text or chat history is ever stored — only accounts
// and the profile each user explicitly saves.

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { getDb } from './db';

export const SESSION_COOKIE = 'knock_session';
const SESSION_DAYS = 30;

export interface SessionUser { id: number; name: string; email: string }

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const candidate = scryptSync(password, salt, 64);
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

export function findUserByEmail(email: string) {
  const row = getDb().prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?').get(email);
  return (row as undefined | { id: number; email: string; name: string; password_hash: string }) ?? null;
}

export function createUser(email: string, name: string, password: string): SessionUser {
  const db = getDb();
  const result = db.prepare('INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)').run(email, name, hashPassword(password), new Date().toISOString());
  return { id: Number(result.lastInsertRowid), name, email };
}

export function createSession(userId: number): string {
  const db = getDb();
  // Opportunistic cleanup of expired sessions.
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString());
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expires);
  return token;
}

export function deleteSession(token: string): void {
  getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function readSessionCookie(request: Request): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === SESSION_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function getSessionUser(request: Request): SessionUser | null {
  const token = readSessionCookie(request);
  if (!token || token.length < 32 || !/^[a-f0-9]+$/.test(token)) return null;
  const row = getDb().prepare(
    'SELECT u.id, u.name, u.email, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?',
  ).get(token);
  if (!row) return null;
  const session = row as { id: number; name: string; email: string; expires_at: string };
  if (new Date(session.expires_at).getTime() < Date.now()) {
    deleteSession(token);
    return null;
  }
  return { id: session.id, name: session.name, email: session.email };
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_DAYS * 86400,
};

export function findUserById(id: number) {
  const row = getDb().prepare('SELECT id, email, name, password_hash FROM users WHERE id = ?').get(id);
  return (row as undefined | { id: number; email: string; name: string; password_hash: string }) ?? null;
}

export function updateUserName(userId: number, name: string): void {
  getDb().prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId);
}

export function updatePassword(userId: number, password: string): void {
  getDb().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), userId);
}

/** After a password change, sign the user out everywhere except the current session. */
export function deleteOtherSessions(userId: number, keepToken: string): void {
  getDb().prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').run(userId, keepToken);
}