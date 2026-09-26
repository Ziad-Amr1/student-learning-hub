// S3 + S4 — API-level verification of the post-migration state and of the
// HTTP contract, exercised over a real ephemeral HTTP server (node:http +
// built-in fetch; no new dependencies). Each test files' process runs its own
// temp SQLite DB, so nothing here touches backend/data/huby.db or the legacy
// JSON sources.
//
// Covered:
//  - S3 §6 cases A (migrated), B (fresh), C (legacy-browser import) + seed
//    safety (no duplicates, no overwrites), and restart-no-rerun regression.
//  - S4 §8 envelopes, §9 CRUD parity, §10 data integrity, §11 error behavior
//    (no raw SQLite leakage), §12 restart persistence (in-process reopen).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { initDatabase, closeDatabase } from '../src/db/init.js'
import { runLegacyJsonMigration } from '../src/db/legacyMigration.js'
import app from '../src/app.js'
import { errorHandler } from '../src/middleware/errorHandler.js'

let root
let server
let base

// --- environment helpers ------------------------------------------------------

// Fresh temp DB + fresh (realistic) legacy sources. Must be called at the top
// of every test so each test is fully isolated.
function freshEnv() {
  closeDatabase()
  if (root) rmSync(root, { recursive: true, force: true })
  root = mkdtempSync(join(tmpdir(), 'huby-api-'))
  const dbPath = join(root, 'test.db')
  const srcDir = join(root, 'src')
  const backupRoot = join(root, 'backups')
  mkdirSync(srcDir, { recursive: true })
  initDatabase({ path: dbPath })
  return { dbPath, srcDir, backupRoot }
}

function writeSource(srcDir, name, records) {
  writeFileSync(join(srcDir, `${name}.json`), JSON.stringify(records, null, 2), 'utf-8')
}

function backupDirs(backupRoot) {
  return existsSync(backupRoot) ? readdirSync(backupRoot) : []
}

// Realistic five-domain fixture set (mirrors the repo's own seeds).
function writeFullDataset(srcDir) {
  writeSource(srcDir, 'tasks', [
    {
      id: 't1',
      title: 'Finish React hooks exercise',
      description: 'Complete exercises 3–5 from chapter 7.',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2026-08-26T00:00:00.000Z',
      createdAt: '2026-08-22T10:12:00.000Z',
    },
    {
      id: 't2',
      title: 'Legacy todo task',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: null,
      createdAt: '2026-08-23T09:40:00.000Z',
    },
  ])
  writeSource(srcDir, 'notes', [
    {
      id: 'n1',
      title: 'Router notes',
      content: 'react-router setup notes',
      category: 'React',
      pinned: true,
      createdAt: '2026-09-03T14:37:00.207Z',
      updatedAt: '2026-09-03T14:37:00.207Z',
    },
  ])
  writeSource(srcDir, 'resources', [
    {
      id: 'r1',
      title: 'MDN docs',
      url: 'https://developer.mozilla.org/',
      category: 'article',
      description: 'Reference documentation',
      pinned: true,
      createdAt: '2026-09-03T14:37:01.736Z',
    },
  ])
  writeSource(srcDir, 'learning', [
    {
      id: 'l1',
      title: 'Deep Work',
      category: 'book',
      status: 'completed',
      progress: 100,
      pinned: false,
      totalPages: 304,
      relatedNotes: ['n1'],
      relatedResources: ['r1'],
      startedAt: '2026-09-03T14:36:43.923Z',
      completedAt: '2026-09-10T08:00:00.000Z',
      createdAt: '2026-09-03T14:36:43.923Z',
      updatedAt: '2026-09-03T14:36:43.923Z',
    },
  ])
  writeSource(srcDir, 'profile', [
    {
      id: 'profile',
      name: 'Kayn Shah',
      avatarUrl: '',
      university: 'Cairo University',
      major: 'Computer Science',
      bio: 'Frontend-focused CS student.',
      skills: ['React', 'JavaScript', 'CSS'],
    },
  ])
}

// --- HTTP helper --------------------------------------------------------------

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => null)
  return { status: res.status, json }
}

before(async () => {
  server = createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const port = server.address().port
  base = `http://127.0.0.1:${port}/api`
})

after(() => {
  server?.close()
  closeDatabase()
  if (root) rmSync(root, { recursive: true, force: true })
})

// --- S3 §6 — cases A / B / C + seed safety + restart --------------------------

test('S3 Case B — a fresh installation serves empty collections', async () => {
  freshEnv()
  for (const domain of ['tasks', 'notes', 'resources', 'learning']) {
    const { status, json } = await request(`/${domain}`)
    assert.equal(status, 200)
    assert.equal(json.success, true)
    assert.equal(json.count, 0)
    assert.deepEqual(json.data, [])
  }
  const profile = await request('/profile')
  assert.equal(profile.status, 200)
  assert.equal(profile.json.success, true)
  assert.equal(profile.json.data, null)
})

test('S3 Case B — seeding mechanism equivalent works against an empty backend', async () => {
  freshEnv()
  // The frontend seed path is exactly a POST with a preserved id + full payload.
  const { status, json } = await request('/tasks', {
    method: 'POST',
    body: {
      id: 'seed-1',
      title: 'Set up the course project repository',
      priority: 'low',
      status: 'unstarted',
      createdAt: '2026-08-24T08:00:00.000Z',
    },
  })
  assert.equal(status, 201)
  assert.equal(json.success, true)
  assert.equal(json.data.id, 'seed-1', 'seed id must be preserved')

  const list = await request('/tasks')
  assert.equal(list.json.count, 1)
  assert.equal(list.json.data[0].id, 'seed-1')
  assert.equal(list.json.data[0].status, 'unstarted')
})

test('S3 Case A — a migrated installation serves the migrated records', async () => {
  const { srcDir } = freshEnv()
  writeFullDataset(srcDir)
  const migration = runLegacyJsonMigration({ sourceDir: srcDir, backupDir: join(root, 'backups') })
  assert.equal(migration.status, 'migrated')

  const tasks = await request('/tasks')
  assert.equal(tasks.json.success, true)
  assert.equal(tasks.json.count, 2)
  const migratedTodo = tasks.json.data.find((t) => t.id === 't2')
  assert.equal(migratedTodo.status, 'unstarted', 'legacy todo alias normalized')

  const notes = await request('/notes')
  assert.equal(notes.json.count, 1)
  assert.equal(notes.json.data[0].pinned, true)
  assert.equal(notes.json.data[0].category, 'React')
  assert.equal(notes.json.data[0].createdAt, '2026-09-03T14:37:00.207Z')

  const resources = await request('/resources')
  assert.equal(resources.json.count, 1)
  assert.equal(resources.json.data[0].url, 'https://developer.mozilla.org/')

  const learning = await request('/learning')
  assert.equal(learning.json.count, 1)
  const book = learning.json.data[0]
  assert.equal(book.status, 'completed')
  assert.equal(book.progress, 100)
  assert.equal(book.totalPages, 304)
  assert.equal(book.completedAt, '2026-09-10T08:00:00.000Z')
  assert.deepEqual(book.relatedNotes, ['n1'])
  assert.deepEqual(book.relatedResources, ['r1'], 'JSON-array columns round-trip')

  const profile = await request('/profile')
  assert.equal(profile.json.success, true)
  assert.equal(profile.json.data.name, 'Kayn Shah')
  assert.deepEqual(profile.json.data.skills, ['React', 'JavaScript', 'CSS'])

  assert.equal(profile.json.data.id, undefined, 'profile id is an internal storage detail, not exposed')
})

test('S3 §4 — re-seeding migrated data does not duplicate or overwrite', async () => {
  const { srcDir } = freshEnv()
  writeFullDataset(srcDir)
  runLegacyJsonMigration({ sourceDir: srcDir, backupDir: join(root, 'backups') })

  // A re-seed re-POSTs the same ids (idempotent create returns the existing
  // record). Send a DIFFERENT title to prove no silent overwrite.
  const before = await request('/tasks')
  const reseed = await request('/tasks', {
    method: 'POST',
    body: { id: 't1', title: 'Spurious re-seed title', priority: 'low', status: 'unstarted' },
  })
  assert.equal(reseed.status, 201, 'idempotent create succeeds')
  assert.equal(reseed.json.data.id, 't1')
  assert.equal(reseed.json.data.title, 'Finish React hooks exercise', 'existing record returned, not overwritten')

  const after = await request('/tasks')
  assert.equal(after.json.count, before.json.count, 'no duplicate records from re-seeding')
  const original = after.json.data.find((t) => t.id === 't1')
  assert.equal(original.title, 'Finish React hooks exercise')
  assert.equal(original.priority, 'high')
})

test('S3 Case C — legacy-browser import through the API is retry-safe', async () => {
  freshEnv()
  // useRemoteSeed imports legacy localStorage records via POST preserving ids.
  const { status } = await request('/tasks', {
    method: 'POST',
    body: { id: 'legacy-1', title: 'Browser-only legacy task' },
  })
  assert.equal(status, 201)

  // A retry after partial failure re-POSTs the SAME id — must be a no-op.
  const retry = await request('/tasks', {
    method: 'POST',
    body: { id: 'legacy-1', title: 'Browser-only legacy task' },
  })
  assert.equal(retry.status, 201)
  const list = await request('/tasks')
  assert.equal(list.json.count, 1)
  assert.equal(list.json.data[0].title, 'Browser-only legacy task')
})

test('S3 §6 — restart: migration does not rerun, data is intact, no new backup', async () => {
  const { dbPath, srcDir, backupRoot } = freshEnv()
  writeFullDataset(srcDir)
  const migration = runLegacyJsonMigration({ sourceDir: srcDir, backupDir: backupRoot })
  assert.equal(migration.status, 'migrated')
  assert.equal(backupDirs(backupRoot).length, 1)

  // A record created through the API after migration.
  const created = await request('/tasks', { method: 'POST', body: { title: 'API-created task' } })
  assert.equal(created.status, 201)

  // Simulate a process restart: close the connection and reopen the SAME db.
  closeDatabase()
  initDatabase({ path: dbPath })

  const rerun = runLegacyJsonMigration({ sourceDir: srcDir, backupDir: backupRoot })
  assert.equal(rerun.status, 'skipped', 'restart must short-circuit on the marker')
  assert.equal(backupDirs(backupRoot).length, 1, 'a skipped re-run must not create a new backup')

  const tasks = await request('/tasks')
  assert.equal(tasks.json.count, 3)
  assert.ok(tasks.json.data.some((t) => t.id === created.json.data.id), 'API-created record must survive the restart')
  assert.ok(tasks.json.data.some((t) => t.id === 't2'), 'migrated records must survive the restart')
  assert.equal(tasks.json.data.find((t) => t.id === 't2').status, 'unstarted')

  const profile = await request('/profile')
  assert.equal(profile.json.data.name, 'Kayn Shah')
})

// --- S4 §8/§9/§10 — CRUD parity + data integrity ---------------------------------

test('S4 §9 — array-domain CRUD parity + success envelopes', async () => {
  freshEnv()

  // Tasks
  let res = await request('/tasks', {
    method: 'POST',
    body: { title: 'Review router notes', priority: 'high', status: 'unstarted', dueDate: '2026-08-27T00:00:00.000Z' },
  })
  assert.equal(res.status, 201)
  assert.deepEqual(Object.keys(res.json).sort(), ['data', 'success'])
  const taskId = res.json.data.id
  res = await request('/tasks')
  assert.equal(res.json.count, 1)
  assert.equal(res.json.data[0].dueDate, '2026-08-27T00:00:00.000Z', 'dueDate normalized to ISO')
  assert.equal(res.json.data[0].priority, 'high')
  res = await request(`/tasks/${taskId}`, { method: 'PUT', body: { status: 'done' } })
  assert.equal(res.status, 200)
  assert.equal(res.json.data.status, 'done')
  res = await request(`/tasks/${taskId}`, { method: 'DELETE' })
  assert.equal(res.status, 200)
  assert.deepEqual(res.json, { success: true, message: 'Task deleted successfully.' })
  res = await request('/tasks')
  assert.equal(res.json.count, 0, 'deleted record must stay gone within the same session')

  // Notes
  res = await request('/notes', {
    method: 'POST',
    body: { title: 'React hooks', content: 'Three rules of hooks.', category: 'React' },
  })
  assert.equal(res.status, 201)
  const noteId = res.json.data.id
  res = await request(`/notes/${noteId}`, { method: 'PUT', body: { pinned: true } })
  assert.equal(res.json.data.pinned, true)
  res = await request(`/notes/${noteId}`, { method: 'DELETE' })
  assert.equal(res.json.message.includes('deleted'), true)

  // Resources
  res = await request('/resources', {
    method: 'POST',
    body: { title: 'Tailwind docs', url: 'https://tailwindcss.com/docs', category: 'course' },
  })
  assert.equal(res.status, 201)
  const resourceId = res.json.data.id
  res = await request(`/resources/${resourceId}`, { method: 'PUT', body: { pinned: true } })
  assert.equal(res.json.data.pinned, true)
  assert.equal(res.json.data.url, 'https://tailwindcss.com/docs')
  res = await request(`/resources/${resourceId}`, { method: 'DELETE' })
  assert.equal(res.status, 200)

  // Learning
  res = await request('/learning', {
    method: 'POST',
    body: { title: 'CSS Deep Dive', category: 'video', status: 'in-progress', progress: 40 },
  })
  assert.equal(res.status, 201)
  const learningId = res.json.data.id
  assert.ok(res.json.data.startedAt, 'entering in-progress starts the clock')
  res = await request(`/learning/${learningId}`, { method: 'PUT', body: { pinned: true } })
  assert.equal(res.json.data.pinned, true)
  res = await request(`/learning/${learningId}`, { method: 'DELETE' })
  assert.equal(res.status, 200)
})

test('S4 §10 — learning status/progress invariant survive the API', async () => {
  freshEnv()
  let res = await request('/learning', {
    method: 'POST',
    body: { title: 'Deep Work', category: 'book', status: 'in-progress', progress: 60, totalPages: 304 },
  })
  assert.equal(res.status, 201)
  const id = res.json.data.id

  const done = await request(`/learning/${id}`, { method: 'PUT', body: { status: 'completed' } })
  assert.equal(done.json.data.status, 'completed')
  assert.equal(done.json.data.progress, 100, 'completed forces progress to 100')
  assert.ok(done.json.data.completedAt, 'completed sets completedAt')

  const editedAway = await request(`/learning/${id}`, {
    method: 'PUT',
    body: { status: 'not-started', progress: 0 },
  })
  assert.equal(editedAway.json.data.status, 'not-started')
  assert.equal(editedAway.json.data.progress, 0)
  assert.equal(editedAway.json.data.completedAt, null, 'editing away from completed clears completedAt')

  const clump = await request(`/learning/${id}`, { method: 'PUT', body: { progress: 150 } })
  assert.equal(clump.json.data.progress, 100, 'progress is clamped to 0–100')

  const archived = await request(`/learning/${id}`, { method: 'DELETE' })
  assert.equal(archived.status, 200)
  assert.equal((await request('/learning')).json.count, 0)
})

test('S4 §10 — profile stays a singleton through the API', async () => {
  freshEnv()
  let res = await request('/profile', {
    method: 'PUT',
    body: {
      name: 'Kayn Shah',
      avatarUrl: '',
      university: 'Cairo University',
      major: 'Computer Science',
      skills: ['React', 'JavaScript'],
    },
  })
  assert.equal(res.status, 200)
  assert.equal(res.json.data.name, 'Kayn Shah')

  res = await request('/profile', {
    method: 'PUT',
    body: { name: 'Kayn S.', avatarUrl: '', skills: ['React'] },
  })
  assert.equal(res.json.data.name, 'Kayn S.')
  assert.deepEqual(res.json.data.skills, ['React'])

  const read = await request('/profile')
  assert.equal(read.json.data.name, 'Kayn S.')
  assert.equal(read.json.data.id, undefined)
})

// --- S4 §8/§11 — error behavior + no infrastructure leakage ---------------------

test('S4 §8 — error envelope and status behavior', async () => {
  freshEnv()

  const missing = await request('/tasks/does-not-exist', { method: 'PUT', body: { status: 'done' } })
  assert.equal(missing.status, 404)
  assert.deepEqual(missing.json, { success: false, message: "Task with id 'does-not-exist' was not found." })

  const deleteMissing = await request('/tasks/does-not-exist', { method: 'DELETE' })
  assert.equal(deleteMissing.status, 404)
  assert.equal(deleteMissing.json.success, false)

  const invalid = await request('/tasks', { method: 'POST', body: {} })
  assert.equal(invalid.status, 400)
  assert.equal(invalid.json.success, false)
  assert.ok(invalid.json.message.includes('title'), `validation message names the field (${invalid.json.message})`)
  assert.deepEqual(Object.keys(invalid.json).sort(), ['message', 'success'])

  const invalidResource = await request('/resources', { method: 'POST', body: { title: 'no url' } })
  assert.equal(invalidResource.status, 400)
  assert.ok(invalidResource.json.message.includes('url'))

  const unknownRoute = await request('/does-not-exist')
  assert.equal(unknownRoute.status, 404)
  assert.equal(unknownRoute.json.success, false)
  assert.ok(unknownRoute.json.message.startsWith('Route not found'))
})

test('S4 §11 — raw implementation details do not leak to the HTTP client', async () => {
  freshEnv()

  // Direct check: the error handler maps an unknown (SQLite-flavoured) error to
  // the generic 500 message, logging it rather than leaking it.
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
  errorHandler(
    new Error('SQLITE_CONSTRAINT_PRIMARYKEY: UNIQUE constraint failed: tasks.id (id=dup)'),
    {},
    res,
    () => {},
  )
  assert.equal(res.statusCode, 500)
  assert.equal(res.body.success, false)
  assert.equal(res.body.message, 'Something went wrong on the server.')
  assert.ok(!/sqlite|constraint/i.test(res.body.message))
})

// Raw-body helper override loaded above: re-send malformed JSON properly.
test('S4 §11 — malformed request body through fetch (raw body path)', async () => {
  freshEnv()
  const raw = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"broken":',
  })
  const json = await raw.json()
  assert.ok(raw.status >= 400 && raw.status <= 500)
  assert.equal(json.success, false)
  assert.ok(typeof json.message === 'string')
  assert.ok(!/sqlite|constraint/i.test(json.message))
})