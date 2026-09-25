import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { initDatabase, closeDatabase, getDatabase } from '../src/db/init.js'
import {
  runLegacyJsonMigration,
  isMigrationComplete,
  MIGRATION_COMPLETE_KEY,
} from '../src/db/legacyMigration.js'
import * as Task from '../src/models/Task.js'
import * as Note from '../src/models/Note.js'
import * as Resource from '../src/models/Resource.js'
import * as Learning from '../src/models/Learning.js'
import * as Profile from '../src/models/Profile.js'

let root
let sourceDir
let backupRoot

// --- fixture builders --------------------------------------------------------

function task(id, overrides = {}) {
  return {
    id,
    title: `Task ${id}`,
    description: `description for ${id}`,
    priority: 'medium',
    status: 'unstarted',
    dueDate: '2026-08-27T10:37:00.000Z',
    createdAt: '2026-09-03T14:36:43.916Z',
    ...overrides,
  }
}

function note(id, overrides = {}) {
  return {
    id,
    title: `Note ${id}`,
    content: `content of ${id}`,
    category: 'React',
    pinned: true,
    createdAt: '2026-09-03T14:37:00.207Z',
    updatedAt: '2026-09-03T14:37:00.207Z',
    ...overrides,
  }
}

function resource(id, overrides = {}) {
  return {
    id,
    title: `Resource ${id}`,
    url: `https://example.com/${id}`,
    category: 'article',
    description: `description ${id}`,
    pinned: false,
    createdAt: '2026-09-03T14:37:01.736Z',
    ...overrides,
  }
}

function learningEntry(id, overrides = {}) {
  return {
    id,
    title: `Learning ${id}`,
    category: 'course',
    status: 'in-progress',
    progress: 62,
    pinned: false,
    targetHours: 120,
    completedHours: 74,
    totalPages: undefined,
    videoMinutes: undefined,
    relatedNotes: [],
    relatedResources: ['res-1'],
    startedAt: '2026-09-03T14:36:43.923Z',
    completedAt: null,
    createdAt: '2026-09-03T14:36:43.923Z',
    updatedAt: '2026-09-03T14:36:43.923Z',
    ...overrides,
  }
}

function fullProfile(overrides = {}) {
  return {
    id: 'profile',
    name: 'Kayn Shah',
    university: 'Cairo University',
    major: 'Computer Science',
    bio: 'Frontend-focused CS student.',
    skills: ['React', 'JavaScript'],
    ...overrides,
  }
}

// Write a legacy source file (domain name → array of records). Returns the
// parsed original for later equality checks.
function writeSource(name, records, dir = sourceDir) {
  const file = join(dir, `${name}.json`)
  writeFileSync(file, JSON.stringify(records, null, 2), 'utf-8')
  return JSON.parse(readFileSync(file, 'utf-8'))
}

function writeFullDataset() {
  return {
    tasks: writeSource('tasks', [task('t1'), task('t2', { priority: 'high' })]),
    notes: writeSource('notes', [note('n1'), note('n2', { pinned: false, category: undefined })]),
    resources: writeSource('resources', [resource('r1'), resource('r2', { pinned: true })]),
    learning: writeSource('learning', [
      learningEntry('l1'),
      learningEntry('l2', {
        category: 'book',
        status: 'completed',
        progress: 100,
        totalPages: 430,
        completedAt: '2026-09-10T08:00:00.000Z',
      }),
    ]),
    profile: writeSource('profile', [fullProfile()]),
  }
}

function backupDirs() {
  return existsSync(backupRoot) ? readdirSync(backupRoot) : []
}

function tableCount(table) {
  return getDatabase().prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'huby-migrate-'))
  sourceDir = join(root, 'src')
  backupRoot = join(root, 'backups')
  mkdirSync(sourceDir, { recursive: true })
  initDatabase({ path: join(root, 'test.db') })
})

afterEach(() => {
  closeDatabase()
  rmSync(root, { recursive: true, force: true })
})

// --- tests -------------------------------------------------------------------

test('migrates all five domains preserving ids, values, arrays, and timestamps', () => {
  const original = writeFullDataset()
  const result = runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })

  assert.equal(result.status, 'migrated')
  assert.deepEqual(result.domains, ['tasks', 'notes', 'resources', 'learning', 'profile'])
  assert.deepEqual(result.counts, { tasks: 2, notes: 2, resources: 2, learning: 2, profile: 1 })

  // tasks
  const tasks = Task.findAll()
  assert.equal(tasks.length, 2)
  const t1 = tasks.find((task) => task.id === 't1')
  assert.equal(t1.title, 'Task t1')
  assert.equal(t1.priority, 'medium')
  assert.equal(t1.status, 'unstarted')
  assert.equal(t1.dueDate, '2026-08-27T10:37:00.000Z')
  assert.equal(t1.createdAt, original.tasks[0].createdAt, 'server-managed createdAt must be preserved')

  // notes — timestamps restored, optional field falls back to undefined
  const notes = Note.findAll()
  assert.equal(notes.length, 2)
  assert.equal(notes.find((note) => note.id === 'n1').updatedAt, original.notes[0].updatedAt)
  assert.equal(notes.find((note) => note.id === 'n2').category, undefined)
  assert.equal(notes.find((note) => note.id === 'n2').pinned, false)

  // resources
  const resources = Resource.findAll()
  assert.equal(resources.length, 2)
  assert.equal(resources.find((it) => it.id === 'r2').pinned, true)
  assert.equal(resources.find((it) => it.id === 'r1').createdAt, original.resources[0].createdAt)

  // learning — book entry preserves totalPages + startedAt; completed entry
  // preserves progress 100 + completedAt + arrays round-trip
  const learning = Learning.findAll()
  assert.equal(learning.length, 2)
  const book = learning.find((it) => it.id === 'l1')
  assert.equal(book.totalPages, undefined)
  assert.equal(book.startedAt, '2026-09-03T14:36:43.923Z')
  assert.deepEqual(book.relatedResources, ['res-1'])
  const done = learning.find((it) => it.id === 'l2')
  assert.equal(done.status, 'completed')
  assert.equal(done.progress, 100)
  assert.equal(done.totalPages, 430)
  assert.equal(done.completedAt, '2026-09-10T08:00:00.000Z')
  assert.equal(done.createdAt, original.learning[1].createdAt)
  assert.equal(done.updatedAt, original.learning[1].updatedAt)

  // profile — singleton, values + skills preserved
  const profile = Profile.get()
  assert.equal(tableCount('profile'), 1)
  assert.equal(getDatabase().prepare('SELECT MAX(id) AS id FROM profile').get().id, 'profile')
  assert.equal(profile.name, 'Kayn Shah')
  assert.deepEqual(profile.skills, ['React', 'JavaScript'])
  assert.equal(profile.major, 'Computer Science')

  // completion marker present
  assert.ok(isMigrationComplete(), 'completion marker must be set after success')
  assert.equal(
    getDatabase().prepare('SELECT value FROM app_meta WHERE key = ?').get(MIGRATION_COMPLETE_KEY)
      .value,
    '1',
  )

  // legacy JSON files must be untouched on disk
  for (const name of Object.keys(original)) {
    assert.deepEqual(JSON.parse(readFileSync(join(sourceDir, `${name}.json`), 'utf-8')), original[name])
  }

  // backup created before import, containing the source content
  assert.equal(backupDirs().length, 1)
  const backupDir = join(backupRoot, backupDirs()[0])
  for (const name of Object.keys(original)) {
    assert.ok(existsSync(join(backupDir, `${name}.json`)), `backup for ${name} must exist`)
    assert.deepEqual(
      JSON.parse(readFileSync(join(backupDir, `${name}.json`), 'utf-8')),
      original[name],
      `backup of ${name} must equal the original`,
    )
  }
})

test('second run is a no-op: returns skipped, no duplicates, no extra backup', () => {
  writeFullDataset()
  const first = runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  assert.equal(first.status, 'migrated')
  assert.deepEqual(backupDirs().length, 1)

  const second = runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  assert.equal(second.status, 'skipped')

  assert.equal(tableCount('tasks'), 2)
  assert.equal(tableCount('notes'), 2)
  assert.equal(tableCount('resources'), 2)
  assert.equal(tableCount('learning'), 2)
  assert.equal(tableCount('profile'), 1)
  assert.equal(backupDirs().length, 1, 'no backup for a skipped re-run')
  assert.ok(isMigrationComplete())
})

test('clean install with no legacy data writes no marker and creates no backup', () => {
  const result = runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  assert.equal(result.status, 'no-data')
  assert.equal(tableCount('tasks'), 0)
  assert.equal(tableCount('profile'), 0)
  assert.equal(Profile.get(), null)
  assert.ok(!isMigrationComplete(), 'no marker on a pristine install')
  assert.equal(backupDirs().length, 0, 'nothing to back up')
})

test('empty array files count as no data and are not backed up', () => {
  writeFileSync(join(sourceDir, 'tasks.json'), '[  ]\n', 'utf-8')
  writeFileSync(join(sourceDir, 'notes.json'), '[]\n', 'utf-8')
  const result = runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  assert.equal(result.status, 'no-data')
  assert.equal(tableCount('tasks'), 0)
  assert.ok(!isMigrationComplete())
  assert.equal(backupDirs().length, 0)
})

test('corrupt JSON fails the migration loudly, rolls back, and writes no marker', () => {
  writeSource('tasks', [task('t1')])
  writeFileSync(join(sourceDir, 'notes.json'), '{ not valid json', 'utf-8')

  assert.throws(() => runLegacyJsonMigration({ sourceDir, backupDir: backupRoot }), /invalid JSON/)

  assert.equal(tableCount('tasks'), 0, 'transaction must roll back fully')
  assert.ok(!isMigrationComplete())
})

test('invalid record surfaces the failing domain and record', () => {
  writeSource('tasks', [task('t1'), task('t2', { title: '' })])
  assert.throws(
    () => runLegacyJsonMigration({ sourceDir, backupDir: backupRoot }),
    /'tasks' record 2\/2 is invalid/,
  )
  assert.equal(tableCount('tasks'), 0)
  assert.ok(!isMigrationComplete())
})

test('duplicate id within a source file is rejected without importing anything', () => {
  writeSource('tasks', [task('t1'), task('t1')])
  assert.throws(
    () => runLegacyJsonMigration({ sourceDir, backupDir: backupRoot }),
    /duplicate id 't1'/,
  )
  assert.equal(tableCount('tasks'), 0)
  assert.ok(!isMigrationComplete())
})

test('a partial failure rolls back so a fixed restart imports everything', () => {
  writeSource('tasks', [task('t1')])
  writeSource('notes', [note('n1')])
  writeSource('learning', [learningEntry('l1'), learningEntry('l2', { category: 'movie' })])
  writeSource('resources', [resource('r1')])
  writeSource('profile', [fullProfile()])

  assert.throws(
    () => runLegacyJsonMigration({ sourceDir, backupDir: backupRoot }),
    /'learning' record 2\/2 is invalid/,
  )

  // every domain rolled back, even the ones imported before the failure
  assert.equal(tableCount('tasks'), 0)
  assert.equal(tableCount('notes'), 0)
  assert.equal(tableCount('resources'), 0)
  assert.equal(tableCount('learning'), 0)
  assert.equal(tableCount('profile'), 0)
  assert.ok(!isMigrationComplete(), 'no marker after a failed run')

  // the pre-import backup survives and still holds the original (invalid) data
  assert.equal(backupDirs().length, 1)
  const learningBackup = join(backupRoot, backupDirs()[0], 'learning.json')
  assert.ok(existsSync(learningBackup), 'backup must be written before the import')
  assert.equal(JSON.parse(readFileSync(learningBackup, 'utf-8'))[1].category, 'movie')

  // fixing the source and restarting migrates the full dataset
  writeFileSync(
    join(sourceDir, 'learning.json'),
    JSON.stringify([learningEntry('l1'), learningEntry('l2', { category: 'practice' })], null, 2),
    'utf-8',
  )
  const again = runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  assert.equal(again.status, 'migrated')
  assert.equal(tableCount('tasks'), 1)
  assert.equal(tableCount('notes'), 1)
  assert.equal(tableCount('resources'), 1)
  assert.equal(tableCount('learning'), 2)
  assert.equal(tableCount('profile'), 1)
  assert.ok(isMigrationComplete())
})

test('legacy Task status alias `todo` is normalized to `unstarted`', () => {
  writeSource('tasks', [task('legacy-todo', { status: 'todo' })])
  const result = runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  assert.equal(result.status, 'migrated')
  const migrated = Task.findById('legacy-todo')
  assert.equal(migrated.status, 'unstarted')
})

test('missing optional fields fall back to the model defaults', () => {
  writeSource('tasks', [
    {
      id: 'minimal',
      title: 'Minimal task',
      createdAt: '2026-09-03T14:36:00.000Z',
    },
  ])
  writeSource('learning', [
    {
      id: 'minimal-learning',
      title: 'Minimal learning',
      category: 'topic',
      status: 'not-started',
      progress: 0,
      relatedNotes: [],
      relatedResources: [],
    },
  ])
  runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })

  const migrated = Task.findById('minimal')
  assert.equal(migrated.priority, 'medium')
  assert.equal(migrated.status, 'unstarted')
  assert.equal(migrated.description, '')
  assert.equal(migrated.dueDate, null)
  assert.equal(migrated.createdAt, '2026-09-03T14:36:00.000Z')

  const learning = Learning.findById('minimal-learning')
  assert.equal(learning.pinned, false)
  assert.equal(learning.targetHours, undefined)
  assert.deepEqual(learning.relatedNotes, [])
  assert.equal(learning.startedAt, null)
  assert.equal(learning.completedAt, null)
})

test('learning status/progress invariants survive migration', () => {
  writeSource('learning', [
    learningEntry('done', {
      category: 'course',
      status: 'completed',
      progress: 100,
      completedAt: '2026-09-10T08:00:00.000Z',
    }),
  ])
  runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  const migrated = Learning.findById('done')
  assert.equal(migrated.status, 'completed')
  assert.equal(migrated.progress, 100)
  assert.equal(migrated.completedAt, '2026-09-10T08:00:00.000Z')
})

test('profile stays a singleton across migration and skipped re-run', () => {
  writeSource('profile', [fullProfile()])
  const first = runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  assert.equal(first.status, 'migrated')
  assert.equal(tableCount('profile'), 1)

  runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  assert.equal(tableCount('profile'), 1, 're-run must not duplicate the profile')
  assert.equal(getDatabase().prepare('SELECT MAX(id) AS id FROM profile').get().id, 'profile')
  assert.equal(Profile.get().name, 'Kayn Shah')
})

test('S3 hardening: empty-string optionals are model-canonicalized without failing parity', () => {
  writeSource('profile', [fullProfile({ avatarUrl: '', bio: '' })])
  writeSource('notes', [note('n1', { category: '' })])
  const result = runLegacyJsonMigration({ sourceDir, backupDir: backupRoot })
  assert.equal(result.status, 'migrated')
  assert.equal(Profile.get().avatarUrl, undefined)
  assert.equal(Profile.get().bio, undefined)
  assert.equal(Note.findById('n1').category, undefined)
})