// Account database. Uses Node's built-in SQLite (node:sqlite) — no external
// services, no paid providers. Stores only accounts (email + scrypt password
// hash + name) and each account's profile + language. Conversation text is
// NEVER stored. The data directory is gitignored (.data/).

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  const dir = process.env.KNOCK_DATA_DIR || join(process.cwd(), '.data');
  mkdirSync(dir, { recursive: true });
  db = new DatabaseSync(join(dir, 'knock.db'));
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles (
      user_id INTEGER PRIMARY KEY,
      profile_json TEXT NOT NULL DEFAULT '{}',
      language TEXT NOT NULL DEFAULT 'en',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS scheme_status (
      user_id INTEGER NOT NULL,
      scheme_id TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, scheme_id)
    );
    CREATE TABLE IF NOT EXISTS email_verifications (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'verify_email',
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_email_verifications_user
      ON email_verifications (user_id, purpose);
  `);
  migrate(db);
  return db;
}

/**
 * Additive, idempotent migrations for databases created before a column/table
 * existed. Fresh databases already contain these via the CREATE statements.
 */
function migrate(db: DatabaseSync): void {
  const userCols = db.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>;
  if (!userCols.some(c => c.name === 'email_verified_at')) {
    db.exec('ALTER TABLE users ADD COLUMN email_verified_at TEXT');
  }
}

export interface UserRow { id: number; email: string; name: string; password_hash: string }
export interface ProfileRow { user_id: number; profile_json: string; language: string; updated_at: string }