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
  for (const table of [...TABLES, 'schema_migrations', 'app_meta']) {
    assert.ok(names.includes(table), `expected table ${table} to exist`)
  }
  assert.equal(names.length, TABLES.length + 2)
})

test('records applied migrations in schema_migrations', () => {
  const db = initDatabase({ path: dbPath })
  const rows = db.prepare('SELECT id, name, applied_at FROM schema_migrations ORDER BY id').all()
  assert.equal(rows.length, 6)
  assert.equal(rows[0].id, 1)
  assert.equal(rows[0].name, 'create_initial_domains')
  assert.equal(rows[1].id, 2)
  assert.equal(rows[1].name, 'create_app_meta')
  assert.equal(rows[2].id, 3)
  assert.equal(rows[2].name, 'create_library')
  assert.equal(rows[3].id, 4)
  assert.equal(rows[3].name, 'add_library_total_pages')
  assert.equal(rows[4].id, 5)
  assert.equal(rows[4].name, 'add_task_category')
  assert.equal(rows[5].id, 6)
  assert.equal(rows[5].name, 'add_note_tags')
  assert.ok(typeof rows[0].applied_at === 'string' && rows[0].applied_at.length > 0)
  assert.ok(typeof rows[1].applied_at === 'string' && rows[1].applied_at.length > 0)
  assert.ok(typeof rows[2].applied_at === 'string' && rows[2].applied_at.length > 0)
  assert.ok(typeof rows[3].applied_at === 'string' && rows[3].applied_at.length > 0)
  assert.ok(typeof rows[4].applied_at === 'string' && rows[4].applied_at.length > 0)
  assert.ok(typeof rows[5].applied_at === 'string' && rows[5].applied_at.length > 0)
})

test('is idempotent when migrations are applied twice', () => {
  const db = initDatabase({ path: dbPath })
  runMigrations(db, MIGRATIONS)
  const rows = db.prepare('SELECT id FROM schema_migrations').all()
  assert.equal(rows.length, 6)
  assert.deepEqual(tableNames(db).sort(), [...TABLES, 'schema_migrations', 'app_meta'].sort())
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

// --- Sprint 11 phase 2 — migration v5 add_task_category ------------------------

test('v5 upgrades a v1-v4 database additively and backfills nothing', () => {
  // A database left behind by the previous release: migrations 1-4 only, with a
  // task written before `category` existed.
  const db = initDatabase({ path: dbPath, migrations: MIGRATIONS.filter((m) => m.id <= 4) })
  db.prepare(
    `INSERT INTO tasks (id, title, description, priority, status, dueDate, createdAt)
     VALUES ('task-legacy', 'Legacy task', 'Written before v5', 'high', 'done',
             '2026-09-20T00:00:00.000Z', '2026-09-01T00:00:00.000Z')`,
  ).run()
  assert.deepEqual(
    db
      .prepare('SELECT id FROM schema_migrations ORDER BY id')
      .all()
      .map((row) => row.id),
    [1, 2, 3, 4],
    'the pre-upgrade database is at v1-v4',
  )

  // Applying v5 on top must preserve the existing row byte-for-byte.
  runMigrations(db, MIGRATIONS)

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get('task-legacy')
  assert.equal(row.title, 'Legacy task')
  assert.equal(row.description, 'Written before v5')
  assert.equal(row.priority, 'high')
  assert.equal(row.status, 'done')
  assert.equal(row.dueDate, '2026-09-20T00:00:00.000Z')
  assert.equal(row.createdAt, '2026-09-01T00:00:00.000Z')
  assert.equal(
    row.category,
    null,
    'existing rows must stay uncategorized - no backfill by design',
  )

  const ids = db.prepare('SELECT id FROM schema_migrations ORDER BY id').all().map((r) => r.id)
  assert.deepEqual(ids, [1, 2, 3, 4, 5, 6])
})

test('v5 category column is nullable and free-text (no CHECK vocabulary)', () => {
  const db = initDatabase({ path: dbPath })

  const info = db.prepare('PRAGMA table_info(tasks)').all()
  const category = info.find((column) => column.name === 'category')
  assert.ok(category, 'tasks.category column must exist after v5')
  assert.equal(category.type, 'TEXT')
  assert.equal(category.notnull, 0, 'category must be nullable')
  assert.equal(
    category.dflt_value,
    null,
    'no column default - absent means the client sent nothing, not a magic value',
  )

  // A free-text value the Model accepts must never be rejected by the DB:
  // mixed case, spaces, and a long-ish label all round-trip.
  const cases = ['Exam prep', '  spaced  ', 'C++ / OOP', 'مراجعة']
  for (const [index, value] of cases.entries()) {
    db.prepare(
      `INSERT INTO tasks (id, title, priority, status, createdAt, category)
       VALUES (?, 'T', 'medium', 'unstarted', '2026-09-28T00:00:00.000Z', ?)`,
    ).run(`free-${index}`, value)
  }
  const stored = db
    .prepare("SELECT category FROM tasks WHERE id LIKE 'free-%' ORDER BY id")
    .all()
    .map((row) => row.category)
  assert.deepEqual(stored, cases, 'category is stored verbatim; trimming is the Model\'s job')

  // NULL is accepted so the column can be cleared.
  db.prepare(
    `INSERT INTO tasks (id, title, priority, status, createdAt, category)
     VALUES ('free-null', 'T', 'medium', 'unstarted', '2026-09-28T00:00:00.000Z', NULL)`,
  ).run()
  assert.equal(db.prepare('SELECT category FROM tasks WHERE id = ?').get('free-null').category, null)
})

// --- Sprint 11 phase 4 — migration v6 add_note_tags --------------------------

test('v6 upgrades a v1-v5 database additively and gives legacy notes an empty tag array', () => {
  // A database left behind by the previous release: migrations 1-5 only, with a
  // note written before `tags` existed.
  const db = initDatabase({ path: dbPath, migrations: MIGRATIONS.filter((m) => m.id <= 5) })
  db.prepare(
    `INSERT INTO notes (id, title, content, category, pinned, createdAt, updatedAt)
     VALUES ('note-legacy', 'Legacy note', 'Written before v6', 'exam', 0,
             '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z')`,
  ).run()
  assert.deepEqual(
    db
      .prepare('SELECT id FROM schema_migrations ORDER BY id')
      .all()
      .map((row) => row.id),
    [1, 2, 3, 4, 5],
    'the pre-upgrade database is at v1-v5',
  )

  // Applying v6 on top must preserve the existing row byte-for-byte.
  runMigrations(db, MIGRATIONS)

  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get('note-legacy')
  assert.equal(row.title, 'Legacy note')
  assert.equal(row.content, 'Written before v6')
  assert.equal(row.category, 'exam')
  assert.equal(row.pinned, 0)
  assert.equal(row.updatedAt, '2026-09-01T00:00:00.000Z')
  assert.equal(
    row.tags,
    '[]',
    'legacy notes must read back as an empty tag array - no backfill by design',
  )

  const ids = db.prepare('SELECT id FROM schema_migrations ORDER BY id').all().map((r) => r.id)
  assert.deepEqual(ids, [1, 2, 3, 4, 5, 6])
})

test('v6 tags column is a NOT NULL JSON-text array column defaulting to an empty array', () => {
  const db = initDatabase({ path: dbPath })

  const info = db.prepare('PRAGMA table_info(notes)').all()
  const tags = info.find((column) => column.name === 'tags')
  assert.ok(tags, 'notes.tags column must exist after v6')
  assert.equal(tags.type, 'TEXT')
  assert.equal(tags.notnull, 1, 'tags column must be NOT NULL')
  assert.equal(
    tags.dflt_value,
    "'[]'",
    'the column default is the empty JSON array, so omitting tags is "no tags"',
  )

  // A note created without tags round-trips as the JSON array [], and a JSON
  // array with mixed content round-trips verbatim at the storage layer (the
  // Model — not the DB — owns normalization).
  db.prepare(
    `INSERT INTO notes (id, title, content, createdAt, updatedAt, tags)
     VALUES ('default-tags', 'T', 'C', '2026-09-28T00:00:00.000Z', '2026-09-28T00:00:00.000Z',
             '[" React ", "REACT", ""]')`,
  ).run()
  const stored = db.prepare("SELECT tags FROM notes WHERE id = 'default-tags'").get()
  assert.equal(stored.tags, '[" React ", "REACT", ""]', 'storage layer stores tags verbatim')
})