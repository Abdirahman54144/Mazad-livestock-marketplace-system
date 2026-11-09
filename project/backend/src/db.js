import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'database.sqlite');
const SCHEMA_PATH = join(__dirname, '..', 'sql', 'schema.sql');
const SEED_PATH = join(__dirname, '..', 'sql', 'seed.sql');

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  const schema = readFileSync(SCHEMA_PATH, 'utf-8');
  const seed = readFileSync(SEED_PATH, 'utf-8');

  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec(schema);
  db.exec(seed);
  db.exec('PRAGMA foreign_keys = ON;');

  console.log('Database initialized: schema + seed data applied.');
}

export function ensureSchema() {
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
  ).get();

  if (!tableExists) {
    console.log('No tables found — initializing database...');
    initDatabase();
  }
}
