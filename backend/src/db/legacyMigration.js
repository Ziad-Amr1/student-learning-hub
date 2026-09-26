// S2 — one-time startup migration of the legacy JSON domain files into SQLite.
// Contract (docs/ARCHITECTURE.md, docs/DATA_MODEL.md, PROJECT_PLAN.md Decision
// Log): deterministic, non-destructive, idempotent, retry-safe, crash-safe,
// ID-preserving, verifiable. Runs before Express listens; a failed migration
// aborts startup loudly — the backend never serves a partially migrated DB.
//
// Design notes:
// - Sources are the legacy JSON files (backend/src/data/*.json), read via fs
//   with THROW-ON-PARSE-FAILURE. The legacy JsonStore is NOT used here because
//   its readAll() swallows corrupt JSON to [], which would violate the
//   fail-loudly contract. Originals are never moved, rewritten, or deleted.
// - Import goes through the existing Model create()/upsert(), so the fixed
//   domain rules (validation/normalization/invariants) stay authoritative.
//   Models assign server-managed timestamps on create, so AFTER the model has
//   accepted a record the original createdAt/updatedAt/startedAt/completedAt
//   values are restored via the Store seam (a faithful restore, not a bypass —
//   validation already happened).
// - The legacy Task status alias 'todo' is pre-mapped through the model's own
//   normalizeTaskStatus before create (create would reject it as non-canonical).
// - The whole import + verification + completion-marker write run in ONE
//   transaction: either the DB is fully migrated and permanently marked, or
//   nothing happened. No committed-but-unmarked or partially imported state
//   exists; a crash mid-migration rolls back so the next start retries cleanly.
// - The completion marker lives in the app_meta table (schema migration v2).
//   Re-runs short-circuit on the marker (S3 decides how future source changes
//   are handled; out of scope here).
// - A pristine install (no legacy data) writes NO marker: the backend starts
//   with empty tables and the frontend seeding (useRemoteSeed/useProfile,
//   'seeded' markers) stays solely responsible for fresh users.
// - A backup of every non-empty source file is copied to
//   backend/data/backups/<timestamp>/ before anything transformative happens;
//   a backup failure stops the migration before any write.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { isDeepStrictEqual } from 'node:util'
import { getDatabase } from './init.js'
import { createStore } from '../data/store.js'
import { ValidationError } from '../utils/ValidationError.js'
import * as Task from '../models/Task.js'
import * as Note from '../models/Note.js'
import * as Resource from '../models/Resource.js'
import * as Learning from '../models/Learning.js'
import * as Profile from '../models/Profile.js'

export const MIGRATION_COMPLETE_KEY = 'json_migration_completed'
export const MIGRATION_COMPLETE_VALUE = '1'

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const DEFAULT_SOURCE_DIR = join(ROOT_DIR, 'backend', 'src', 'data')
const DEFAULT_BACKUP_DIR = join(ROOT_DIR, 'backend', 'data', 'backups')

// Low-level store seams used ONLY to restore server-managed timestamps after
// the model has created/validated a record during migration.
const STORES = {
  tasks: createStore('tasks'),
  notes: createStore('notes'),
  resources: createStore('resources'),
  learning: createStore('learning'),
}

const DOMAINS = {
  tasks: {
    file: 'tasks.json',
    // Pre-map the legacy 'todo' alias via the model's own normalizer so the
    // canonical ruleset accepts the record unchanged in every other respect.
    // Only applied when `status` is present, so missing-status records keep no
    // status key (verification then compares nothing for it and the model's
    // default applies).
    normalize: (record) =>
      record.status === undefined ? record : { ...record, status: Task.normalizeTaskStatus(record.status) },
    create: (record) => Task.create(record),
    exists: (record) => Task.findById(record.id) !== null,
    readBack: () => Task.findAll(),
    restoreFields: ['createdAt'],
  },
  notes: {
    file: 'notes.json',
    normalize: (record) => record,
    create: (record) => Note.create(record),
    exists: (record) => Note.findById(record.id) !== null,
    readBack: () => Note.findAll(),
    restoreFields: ['createdAt', 'updatedAt'],
  },
  resources: {
    file: 'resources.json',
    normalize: (record) => record,
    create: (record) => Resource.create(record),
    exists: (record) => Resource.findById(record.id) !== null,
    readBack: () => Resource.findAll(),
    restoreFields: ['createdAt'],
  },
  learning: {
    file: 'learning.json',
    normalize: (record) => record,
    create: (record) => Learning.create(record),
    exists: (record) => Learning.findById(record.id) !== null,
    readBack: () => Learning.findAll(),
    restoreFields: ['createdAt', 'updatedAt', 'startedAt', 'completedAt'],
  },
  profile: {
    file: 'profile.json',
    normalize: (record) => record,
    create: (record) => Profile.upsert(record),
    exists: () => Profile.get() !== null,
    readBack: () => Profile.get(),
    // Profile carries no server-managed timestamps; nothing to restore.
    restoreFields: [],
  },
}

export function isMigrationComplete(db = getDatabase()) {
  const row = db
    .prepare('SELECT value FROM app_meta WHERE key = ?')
    .get(MIGRATION_COMPLETE_KEY)
  return row?.value === MIGRATION_COMPLETE_VALUE
}

// Read every legacy source. Missing files count as "no data". Anything that is
// not valid JSON, is not an array, has a record without a string id, or
// repeats an id WITHIN a file fails the migration explicitly (nothing is
// silently skipped or overwritten).
function readLegacySources(sourceDir) {
  const sources = {}
  for (const [name, domain] of Object.entries(DOMAINS)) {
    const file = join(sourceDir, domain.file)
    if (!existsSync(file)) {
      sources[name] = { file, records: [] }
      continue
    }
    let parsed
    try {
      parsed = JSON.parse(readFileSync(file, 'utf-8'))
    } catch (parseError) {
      throw new Error(
        `Legacy JSON → SQLite migration: invalid JSON in '${file}' (${parseError.message})`,
      )
    }
    if (!Array.isArray(parsed)) {
      throw new Error(
        `Legacy JSON → SQLite migration: '${file}' must contain a JSON array, got ${typeof parsed}.`,
      )
    }
    const seen = new Set()
    for (const record of parsed) {
      if (!record || typeof record !== 'object' || typeof record.id !== 'string' || !record.id) {
        throw new Error(
          `Legacy JSON → SQLite migration: '${file}' contains a record without a string 'id' (${JSON.stringify(record).slice(0, 120)}).`,
        )
      }
      if (seen.has(record.id)) {
        throw new Error(
          `Legacy JSON → SQLite migration: duplicate id '${record.id}' inside '${file}' — refusing to silently overwrite.`,
        )
      }
      seen.add(record.id)
    }
    sources[name] = { file, records: parsed }
  }
  return sources
}

// Copy every non-empty source file into a fresh timestamped backup directory.
// Throws on any failure — the migration halts before a single write. Original
// files are never touched.
function backupSources(sources, backupDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = join(backupDir, timestamp)
  mkdirSync(dir, { recursive: true })
  for (const [name, source] of Object.entries(sources)) {
    if (source.records.length === 0) continue
    copyFileSync(source.file, join(dir, DOMAINS[name].file))
  }
  return dir
}

function restoreServerFields(name, record) {
  const fields = DOMAINS[name].restoreFields
  for (const field of fields) {
    // Skip absent fields (the model already applied its canonical default); a
    // present null is written as NULL (equals the column's default meaning).
    if (record[field] === undefined) continue
    STORES[name].update(record.id, { [field]: record[field] })
  }
}

function importDomain(name, domain, records) {
  for (let index = 0; index < records.length; index++) {
    const record = domain.normalize(records[index])
    try {
      const existed = domain.exists(record)
      domain.create(record)
      if (!existed) restoreServerFields(name, record)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(
          `Legacy JSON → SQLite migration: '${name}' record ${index + 1}/${records.length} is invalid (${error.message})`,
        )
      }
      throw error
    }
  }
}

// S3 hardening: the Models deliberately normalize empty optional strings to
// NULL/undefined (e.g. Profile.avatarUrl '', Note.category '', Resource
// description ''). Parity therefore treats '' ≡ null/undefined — comparing
// against strict values would fail a faithful import just because the Model
// canonicalized an empty optional, and a non-empty value still fails only when
// it is genuinely lost.

function valuesEqual(mine, theirs) {
  const empty = (value) => value === undefined || value === null || value === ''
  if (empty(mine) && empty(theirs)) return true
  return isDeepStrictEqual(theirs, mine)
}

function assertParity(domainName, expectedRecords, dbRecords) {
  assert.equal(
    dbRecords.length,
    expectedRecords.length,
    `${domainName}: migrated row count (${dbRecords.length}) does not match source (${expectedRecords.length})`,
  )
  const jsonIds = expectedRecords.map((record) => String(record.id)).sort()
  const dbIds = dbRecords.map((record) => String(record.id)).sort()
  assert.deepEqual(dbIds, jsonIds, `${domainName}: migrated id set does not match source`)
  for (const expected of expectedRecords) {
    const dbRecord = dbRecords.find((record) => String(record.id) === String(expected.id))
    assert.ok(dbRecord, `${domainName}: no migrated row for id '${expected.id}'`)
    for (const key of Object.keys(expected)) {
      if (key === 'id') continue
      const mine = expected[key] === undefined ? null : expected[key]
      const theirs = dbRecord[key] === undefined ? null : dbRecord[key]
      assert.ok(valuesEqual(mine, theirs), `${domainName}.${expected.id}.${key} mismatch after migration`)
    }
  }
}

function assertProfileParity(expected, dbProfile) {
  assert.ok(dbProfile, 'profile: no migrated row after migration')
  const row = getDatabase().prepare('SELECT COUNT(*) AS n, MAX(id) AS id FROM profile').get()
  assert.equal(row.n, 1, 'profile: singleton must be exactly one row')
  assert.equal(row.id, 'profile', 'profile: id must stay fixed')
  for (const key of Object.keys(expected)) {
    if (key === 'id') continue
    const mine = expected[key] === undefined ? null : expected[key]
    const theirs = dbProfile[key] === undefined ? null : dbProfile[key]
    assert.ok(valuesEqual(mine, theirs), `profile.${key} mismatch after migration`)
  }
}

function verifyMigration(sources, migratedDomains) {
  for (const name of migratedDomains) {
    const domain = DOMAINS[name]
    if (name === 'profile') {
      assertProfileParity(sources.profile.records[0], domain.readBack())
    } else {
      assertParity(name, sources[name].records.map(domain.normalize), domain.readBack())
    }
  }
}

function writeCompletionMarker(db) {
  db.prepare('INSERT INTO app_meta (key, value) VALUES (?, ?)').run(
    MIGRATION_COMPLETE_KEY,
    MIGRATION_COMPLETE_VALUE,
  )
}

// Main entry — called once at server startup, AFTER initDatabase() and BEFORE
// Express listens. Options exist for tests; the server uses the defaults.
export function runLegacyJsonMigration({
  sourceDir = DEFAULT_SOURCE_DIR,
  backupDir = DEFAULT_BACKUP_DIR,
} = {}) {
  const db = getDatabase()

  if (isMigrationComplete(db)) {
    return { status: 'skipped' }
  }

  const sources = readLegacySources(sourceDir)
  const migratedDomains = Object.keys(sources).filter((name) => sources[name].records.length > 0)

  if (migratedDomains.length === 0) {
    // Pristine install: empty tables, no marker. The frontend seeds fresh users.
    return { status: 'no-data' }
  }

  // Backup BEFORE any transformative work; failures halt the migration.
  const backup = backupSources(sources, backupDir)

  // Single transaction: import + verify + marker commit together, so no
  // committed-but-unmarked or partially imported state can ever be served.
  db.exec('BEGIN')
  try {
    for (const name of migratedDomains) {
      importDomain(name, DOMAINS[name], sources[name].records)
    }
    verifyMigration(sources, migratedDomains)
    writeCompletionMarker(db)
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }

  const counts = {}
  for (const name of migratedDomains) counts[name] = sources[name].records.length

  return { status: 'migrated', domains: migratedDomains, backup, counts }
}