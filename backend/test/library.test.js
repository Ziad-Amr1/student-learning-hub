// My Library — model + API verification for the new /api/library domain.
// Model tests exercise the Library model directly (validation, status⇔progress
// invariant, startedAt/finishedAt transitions, optional handling, idempotent
// create); API tests exercise the HTTP contract over a real ephemeral server
// (node:http + built-in fetch). Each test file's process runs its own temp
// SQLite DB, so nothing touches backend/data/huby.db.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { initDatabase, closeDatabase } from '../src/db/init.js'
import app from '../src/app.js'
import * as Library from '../src/models/Library.js'
import { ValidationError } from '../src/utils/ValidationError.js'

let root
let server
let base

function freshDb() {
  closeDatabase()
  if (root) rmSync(root, { recursive: true, force: true })
  root = mkdtempSync(join(tmpdir(), 'huby-library-'))
  initDatabase({ path: join(root, 'test.db') })
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => null)
  return { status: res.status, json }
}

const SAMPLE = {
  title: 'Atomic Habits',
  author: 'James Clear',
  status: 'want-to-read',
  progress: 0,
}

// --- Model-level tests --------------------------------------------------------

test('Library create validates, applies defaults, and persists through the store', () => {
  freshDb()
  const book = Library.create(SAMPLE)
  assert.equal(book.title, 'Atomic Habits')
  assert.equal(book.status, 'want-to-read')
  assert.equal(book.progress, 0)
  assert.equal(book.rating, null)
  assert.equal(book.totalPages, null, 'page tracking is opt-in')
  assert.equal(book.notes, null)
  assert.equal(book.author, 'James Clear')
  assert.deepEqual(book.quotes, [])
  assert.deepEqual(book.relatedResourceIds, [])
  assert.deepEqual(book.relatedLearningIds, [])
  assert.equal(book.startedAt, null)
  assert.equal(book.finishedAt, null)
  assert.ok(book.createdAt && book.updatedAt)
  assert.equal(book.id.length > 0, true)

  const list = Library.findAll()
  assert.equal(list.length, 1)
  assert.equal(list[0].title, 'Atomic Habits')
})

test('Library create-by-id is idempotent (migration-friendly)', () => {
  freshDb()
  const first = Library.create({ id: 'book-1', ...SAMPLE })
  const second = Library.create({ ...SAMPLE, id: 'book-1' })
  assert.equal(second.id, 'book-1')
  assert.equal(Library.findAll().length, 1)
  assert.deepEqual(second, first)
})

test('Library finished status forces progress to 100 and sets finishedAt', () => {
  freshDb()
  const book = Library.create({ ...SAMPLE, status: 'finished', progress: 47 })
  assert.equal(book.status, 'finished')
  assert.equal(book.progress, 100)
  assert.ok(book.finishedAt, 'finishedAt set on entry to finished')

  const viaFactory = Library.create({ ...SAMPLE, progress: 100 })
  assert.equal(viaFactory.status, 'finished')
  assert.equal(viaFactory.progress, 100)
  assert.ok(viaFactory.finishedAt)
})

test('Library dnf records finishedAt without forcing progress', () => {
  freshDb()
  const book = Library.create({ ...SAMPLE, status: 'dnf', progress: 30 })
  assert.equal(book.status, 'dnf')
  assert.equal(book.progress, 30)
  assert.ok(book.finishedAt, 'finishedAt set on entry to dnf')
})

test('Library startedAt transitions are model-owned', () => {
  freshDb()
  const created = Library.create({ ...SAMPLE, status: 'want-to-read' })
  assert.equal(created.startedAt, null)

  const reading = Library.update(created.id, { status: 'reading' })
  assert.ok(reading.startedAt, 'startedAt set on entry to reading')
  assert.equal(reading.finishedAt, null)

  const dnf = Library.update(created.id, { status: 'dnf' })
  assert.ok(dnf.startedAt, 'startedAt preserved while moving to an ending state')
  assert.ok(dnf.finishedAt, 'finishedAt set on entry to dnf')

  const back = Library.update(created.id, { status: 'want-to-read' })
  assert.equal(back.startedAt, null, 'startedAt cleared on return to want-to-read')
  assert.equal(back.finishedAt, null, 'finishedAt cleared when edited away from an ending state')
})

test('Library partial update validates only provided fields and returns null for unknown ids', () => {
  freshDb()
  const book = Library.create(SAMPLE)
  const updated = Library.update(book.id, { rating: 5, notes: 'Loved it' })
  assert.equal(updated.rating, 5)
  assert.equal(updated.notes, 'Loved it')
  assert.equal(updated.title, 'Atomic Habits', 'untouched fields preserved')

  const unknown = Library.update('does-not-exist', { title: 'X' })
  assert.equal(unknown, null)
})

test('Library remove deletes a record and reports not-found afterwards', () => {
  freshDb()
  const book = Library.create(SAMPLE)
  assert.equal(Library.remove(book.id), true)
  assert.equal(Library.remove(book.id), false)
  assert.equal(Library.findAll().length, 0)
})

test('Library JSON-array fields and null-cleared optionals round-trip', () => {
  freshDb()
  const book = Library.create({
    ...SAMPLE,
    quotes: ['"You do not rise to the level of your goals."', 'A second quote'],
    relatedResourceIds: ['r1', 'r2'],
    relatedLearningIds: ['l1'],
    author: 'James Clear',
    notes: 'Habit stacking',
    rating: 4,
  })
  assert.deepEqual(book.quotes, ['"You do not rise to the level of your goals."', 'A second quote'])
  assert.deepEqual(book.relatedResourceIds, ['r1', 'r2'])
  assert.deepEqual(book.relatedLearningIds, ['l1'])

  const cleared = Library.update(book.id, { author: null, notes: '', rating: null })
  assert.equal(cleared.author, null)
  assert.equal(cleared.notes, null)
  assert.equal(cleared.rating, null)

  const stored = Library.findById(book.id)
  assert.deepEqual(stored.quotes, book.quotes, 'array columns survive a second round-trip')
})

test('Library rejects invalid domain values', () => {
  freshDb()
  assert.throws(() => Library.create({ title: '', status: 'want-to-read', progress: 0 }), ValidationError)
  assert.throws(() => Library.create({ title: 'X', status: 'archived', progress: 0 }), ValidationError)
  assert.throws(() => Library.create({ title: 'X', status: 'reading', progress: 130 }), /between|max|range/)
  assert.throws(() => Library.create({ ...SAMPLE, rating: 9 }), /between|max|range/)
  assert.throws(() => Library.create({ ...SAMPLE, quotes: 'not-an-array' }), ValidationError)
  assert.throws(() => Library.create({ title: null, status: 'want-to-read', progress: 0 }), ValidationError)
  assert.equal(Library.update('does-not-exist', {}), null)
})

// --- totalPages (migration v4) ------------------------------------------------

test('Library totalPages is optional, persists, and round-trips through the store', () => {
  freshDb()
  const book = Library.create({ ...SAMPLE, totalPages: 320 })
  assert.equal(book.totalPages, 320)
  assert.equal(book.progress, 0, 'progress stays the single source of truth')

  const stored = Library.findById(book.id)
  assert.equal(stored.totalPages, 320, 'column round-trips')

  const changed = Library.update(book.id, { totalPages: 350 })
  assert.equal(changed.totalPages, 350)
  assert.equal(changed.progress, 0, 'changing the page count never rewrites progress')
})

test('Library rejects non-positive and fractional page counts', () => {
  freshDb()
  assert.throws(() => Library.create({ ...SAMPLE, totalPages: 0 }), ValidationError)
  assert.throws(() => Library.create({ ...SAMPLE, totalPages: -10 }), ValidationError)
  assert.throws(() => Library.create({ ...SAMPLE, totalPages: 12.5 }), /whole number/)
  assert.equal(Library.findAll().length, 0, 'nothing persisted on rejection')
})

test('Library clears totalPages back to null and keeps progress intact', () => {
  freshDb()
  const book = Library.create({ ...SAMPLE, progress: 42, totalPages: 320 })
  const cleared = Library.update(book.id, { totalPages: null })
  assert.equal(cleared.totalPages, null)
  assert.equal(cleared.progress, 42, 'percentage survives leaving page mode')

  const preserved = Library.update(book.id, {})
  assert.equal(preserved.totalPages, null, 'an absent field preserves the stored value')
})

test('Library finished status still forces progress to 100 with a page count set', () => {
  freshDb()
  const book = Library.create({ ...SAMPLE, status: 'finished', progress: 40, totalPages: 320 })
  assert.equal(book.status, 'finished')
  assert.equal(book.progress, 100, 'finished still wins over any page-derived value')
  assert.equal(book.totalPages, 320)

  const raised = Library.update(book.id, { progress: 100 })
  assert.equal(raised.progress, 100)
})

test('Library progress bounds still hold in page mode', () => {
  freshDb()
  // Out-of-range progress is REJECTED (not silently clamped) both with and
  // without a page count - the 0-100 contract is unchanged by page support.
  assert.throws(() => Library.create({ ...SAMPLE, progress: 101, totalPages: 320 }), /between 0 and 100/)
  assert.throws(() => Library.create({ ...SAMPLE, progress: -1, totalPages: 320 }), /between 0 and 100/)

  const book = Library.create({ ...SAMPLE, progress: 100, totalPages: 320 })
  assert.equal(book.progress, 100)
  assert.equal(book.status, 'finished')
})

// --- API-level tests ----------------------------------------------------------

before(async () => {
  freshDb()
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

test('GET /api/library returns an empty collection on a fresh backend', async () => {
  freshDb()
  const { status, json } = await request('/library')
  assert.equal(status, 200)
  assert.deepEqual(json, { success: true, count: 0, data: [] })
})

test('POST /api/library creates, normalizes, and is idempotent by id', async () => {
  freshDb()
  const created = await request('/library', {
    method: 'POST',
    body: { id: 'book-api-1', title: 'Deep Work', status: 'finished', progress: 40 },
  })
  assert.equal(created.status, 201)
  assert.equal(created.json.success, true)
  assert.equal(created.json.data.id, 'book-api-1')
  assert.equal(created.json.data.progress, 100, 'finished forces progress to 100')
  assert.ok(created.json.data.finishedAt)

  const reseed = await request('/library', {
    method: 'POST',
    body: { id: 'book-api-1', title: 'Spurious title', status: 'finished', progress: 40 },
  })
  assert.equal(reseed.status, 201)
  assert.equal(reseed.json.data.title, 'Deep Work', 'idempotent create returns the existing record')

  const list = await request('/library')
  assert.equal(list.json.count, 1)
})

test('POST /api/library rejects invalid payloads with 400', async () => {
  freshDb()
  const missing = await request('/library', { method: 'POST', body: { status: 'reading', progress: 0 } })
  assert.equal(missing.status, 400)
  const badRating = await request('/library', { method: 'POST', body: { ...SAMPLE, rating: 7 } })
  assert.equal(badRating.status, 400)
  const badStatus = await request('/library', { method: 'POST', body: { ...SAMPLE, status: 'archived' } })
  assert.equal(badStatus.status, 400)
  const badPages = await request('/library', { method: 'POST', body: { ...SAMPLE, totalPages: 0 } })
  assert.equal(badPages.status, 400)
  const fractionalPages = await request('/library', { method: 'POST', body: { ...SAMPLE, totalPages: 10.5 } })
  assert.equal(fractionalPages.status, 400)
})

test('GET /api/library exposes the optional totalPages field', async () => {
  freshDb()
  const withPages = await request('/library', {
    method: 'POST',
    body: { ...SAMPLE, progress: 42, totalPages: 320 },
  })
  assert.equal(withPages.status, 201)
  assert.equal(withPages.json.data.totalPages, 320)
  assert.equal(withPages.json.data.progress, 42)

  const withoutPages = await request('/library', { method: 'POST', body: { ...SAMPLE, title: 'No pages' } })
  assert.equal(withoutPages.json.data.totalPages, null, 'absent page count reads back as null')

  const list = await request('/library')
  assert.equal(list.json.count, 2)
})

test('PUT /api/library/:id updates, patching refs after a hybrid create', async () => {
  freshDb()
  const { json: book } = await request('/library', { method: 'POST', body: SAMPLE })
  const patched = await request(`/library/${book.data.id}`, {
    method: 'PUT',
    body: { relatedResourceIds: ['res-1'], relatedLearningIds: ['lrn-1'] },
  })
  assert.equal(patched.status, 200)
  assert.deepEqual(patched.json.data.relatedResourceIds, ['res-1'])
  assert.deepEqual(patched.json.data.relatedLearningIds, ['lrn-1'])

  const missing = await request('/library/does-not-exist', { method: 'PUT', body: { title: 'X' } })
  assert.equal(missing.status, 404)
})

test('DELETE /api/library/:id removes a book and 404s when unknown', async () => {
  freshDb()
  const { json: book } = await request('/library', { method: 'POST', body: SAMPLE })
  const deleted = await request(`/library/${book.data.id}`, { method: 'DELETE' })
  assert.equal(deleted.status, 200)
  assert.deepEqual(deleted.json, { success: true, message: 'Book deleted successfully.' })

  const gone = await request(`/library/${book.data.id}`, { method: 'DELETE' })
  assert.equal(gone.status, 404)

  const list = await request('/library')
  assert.equal(list.json.count, 0)
})