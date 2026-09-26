import { DatabaseSync } from 'node:sqlite'
import { resolveDbPath, ensureDbDir } from './paths.js'
import { runMigrations } from './migrations.js'
import { MIGRATIONS } from './schema.js'

// Single shared SQLite connection for the process. initDatabase() runs once at
// startup (server.js / tests) and the Store layer pulls the database lazily
// via getDatabase(), so Stores may be constructed safely at import time before
// initialization has run.

let _db = null

export function getDatabase() {
  if (!_db) throw new Error('Database not initialized. Call initDatabase() first.')
  return _db
}

export function initDatabase({ path = resolveDbPath(), migrations = MIGRATIONS } = {}) {
  ensureDbDir(path)
  const db = new DatabaseSync(path)
  // WAL: local-first single-user file DB with durable commits and readers that
  // never block the writer. busy_timeout keeps a second connection (e.g. a
  // future migration/backup process) from failing immediately on lock.
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA busy_timeout = 5000')
  // v1 intentionally declares no foreign keys (soft references only), so
  // enforcement stays OFF. Explicit so the intent is visible here.
  db.exec('PRAGMA foreign_keys = OFF')
  runMigrations(db, migrations)
  _db = db
  return db
}

export function closeDatabase() {
  if (_db) {
    _db.close()
    _db = null
  }
}