import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { initDatabase, closeDatabase, getDatabase } from '../src/db/init.js'
import { runMigrations } from '../src/db/migrations.js'
import { MIGRATIONS, TABLES } from '../src/db/schema.js'

let dir
let dbPath

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'huby-db-'))
  dbPath = join(dir, 'test.db')
})

afterEach(() => {
  closeDatabase()
  rmSync(dir, { recursive: true, force: true })
})

function tableNames(db) {
  return db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .all()
    .map((row) => row.name)
}

test('creates the database file and applies the initial schema', () => {
  const db = initDatabase({ path: dbPath })
  assert.equal(getDatabase(), db)
  assert.ok(existsSync(dbPath), 'database file should exist on disk')
  const names = tableNames(db)
  for (const table of [...TABLES, 'schema_migrations']) {
    assert.ok(names.includes(table), `expected table ${table} to exist`)
  }
  assert.equal(names.length, TABLES.length + 1)
})

test('records applied migrations in schema_migrations', () => {
  const db = initDatabase({ path: dbPath })
  const rows = db.prepare('SELECT id, name, applied_at FROM schema_migrations ORDER BY id').all()
  assert.equal(rows.length, 1)
  assert.equal(rows[0].id, 1)
  assert.equal(rows[0].name, 'create_initial_domains')
  assert.ok(typeof rows[0].applied_at === 'string' && rows[0].applied_at.length > 0)
})

test('is idempotent when migrations are applied twice', () => {
  const db = initDatabase({ path: dbPath })
  runMigrations(db, MIGRATIONS)
  const rows = db.prepare('SELECT id FROM schema_migrations').all()
  assert.equal(rows.length, 1)
  assert.deepEqual(tableNames(db).sort(), [...TABLES, 'schema_migrations'].sort())
})

test('enables WAL journal mode and leaves foreign-key enforcement off', () => {
  const db = initDatabase({ path: dbPath })
  assert.equal(db.prepare('PRAGMA journal_mode').get().journal_mode, 'wal')
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 0)
})

test('rolls back a failing migration completely', () => {
  const db = initDatabase({ path: dbPath, migrations: [] })
  const failing = [
    {
      id: 901,
      name: 'broken',
      up: (context) => {
        context.exec('CREATE TABLE partial_rollback (id TEXT)')
        throw new Error('boom')
      },
    },
  ]
  assert.throws(() => runMigrations(db, failing), /boom/)
  assert.ok(!tableNames(db).includes('partial_rollback'), 'failed migration must roll back')
  assert.equal(db.prepare('SELECT id FROM schema_migrations').all().length, 0)
})