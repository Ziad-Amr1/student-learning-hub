import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { initDatabase, closeDatabase } from '../src/db/init.js'
import { ValidationError } from '../src/utils/ValidationError.js'
import * as Task from '../src/models/Task.js'
import * as Note from '../src/models/Note.js'
import * as Resource from '../src/models/Resource.js'
import * as Learning from '../src/models/Learning.js'
import * as Profile from '../src/models/Profile.js'

let dir
let dbPath

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'huby-models-'))
  dbPath = join(dir, 'test.db')
  initDatabase({ path: dbPath })
})

afterEach(() => {
  closeDatabase()
  rmSync(dir, { recursive: true, force: true })
})

test('Task create validates, applies defaults, and persists through the store', () => {
  assert.throws(
    () => Task.create({}),
    (error) => error instanceof ValidationError,
  )

  const created = Task.create({ title: 'Prepare study plan', description: 'First week outline.' })
  assert.ok(typeof created.id === 'string' && created.id.length > 0)
  assert.equal(created.title, 'Prepare study plan')
  assert.equal(created.priority, 'medium')
  assert.equal(created.status, 'unstarted')
  assert.equal(created.dueDate, null)
  assert.ok(created.createdAt)

  const found = Task.findById(created.id)
  assert.equal(found.title, 'Prepare study plan')
  assert.equal(Task.findAll().length, 1)
})

test('Task create-by-id is idempotent (migration-friendly)', () => {
  const id = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
  const first = Task.create({ id, title: 'Legacy task' })
  assert.equal(first.id, id)

  const second = Task.create({ id, title: 'Legacy task' })
  assert.equal(second.id, id)
  assert.equal(Task.findAll().length, 1, 'create-by-id must not duplicate')
})

test('Task partial update validates only provided fields and returns null for unknown ids', () => {
  const created = Task.create({ title: 'Read chapter 9' })
  const updated = Task.update(created.id, { status: 'done' })
  assert.equal(updated.status, 'done')
  assert.equal(updated.title, 'Read chapter 9')
  assert.equal(Task.findById(created.id).status, 'done')
  assert.throws(() => Task.update(created.id, { status: 'not-a-status' }), ValidationError)
  assert.equal(Task.update('unknown-id', { status: 'done' }), null)
})

test('Task remove deletes the record', () => {
  const created = Task.create({ title: 'Do the laundry' })
  assert.equal(Task.remove(created.id), true)
  assert.equal(Task.remove(created.id), false)
  assert.equal(Task.findAll().length, 0)
})

test('Note create normalizes category/pinned and stores updatedAt on content edits only', () => {
  const created = Note.create({ title: 'CSS grid notes', content: 'grid-template-areas cheat sheet', category: '  CSS  ' })
  assert.equal(created.category, 'CSS')
  assert.equal(created.pinned, false)
  assert.ok(created.updatedAt)

  const pinToggled = Note.update(created.id, { pinned: true })
  assert.equal(pinToggled.pinned, true)
  assert.equal(
    pinToggled.updatedAt,
    created.updatedAt,
    'a pin toggle is not a content edit and must not bump updatedAt',
  )
})

test('Resource create validates the URL format', () => {
  assert.throws(
    () => Resource.create({ title: 'Bad link', url: 'not-a-url', category: 'article' }),
    ValidationError,
  )
  const created = Resource.create({
    title: 'Thinking in React',
    url: 'https://react.dev/learn/thinking-in-react',
    category: 'article',
  })
  assert.equal(created.pinned, false)
  assert.equal(Resource.findById(created.id).title, 'Thinking in React')
})

test('Learning create applies the completed ⇔ progress invariant', () => {
  const completed = Learning.create({
    title: 'Clean Architecture',
    category: 'book',
    status: 'completed',
    progress: 50,
    totalPages: 430,
  })
  assert.equal(completed.status, 'completed')
  assert.equal(completed.progress, 100, 'completed status must force progress to 100')
  assert.ok(completed.completedAt, 'completed entries must carry completedAt')

  const read = Learning.findById(completed.id)
  assert.equal(read.status, 'completed')
  assert.equal(read.progress, 100)
  assert.ok(read.completedAt)

  const inProgress = Learning.create({
    title: 'React Testing Library',
    category: 'course',
    status: 'in-progress',
    progress: 30,
  })
  assert.ok(inProgress.startedAt, 'entering in-progress must set startedAt')
})

test('Learning related-item arrays round-trip and optional fields stay undefined', () => {
  const created = Learning.create({
    title: 'Odin — React path',
    category: 'course',
    status: 'not-started',
    progress: 0,
    relatedNotes: ['a3f1c8e2-7b44-4d91-b5e6-1a2c3d4e5f60'],
    relatedResources: ['e1f3a5b7-9c24-4d86-a0e2-3f4c5d6e7f80'],
  })
  const read = Learning.findById(created.id)
  assert.deepEqual(read.relatedNotes, ['a3f1c8e2-7b44-4d91-b5e6-1a2c3d4e5f60'])
  assert.deepEqual(read.relatedResources, ['e1f3a5b7-9c24-4d86-a0e2-3f4c5d6e7f80'])
  assert.equal(read.targetHours, undefined)
  assert.equal(read.totalPages, undefined)
  assert.equal(read.startedAt, null)
  assert.equal(read.completedAt, null)
})

test('Profile upsert validates, stays a singleton, and preserves a fixed id', () => {
  assert.throws(() => Profile.upsert({}), ValidationError)

  const first = Profile.upsert({
    name: 'Ziad Amr',
    university: 'Cairo University',
    major: 'Computer Science',
    skills: ['React', 'JavaScript'],
  })
  assert.equal(first.name, 'Ziad Amr')
  assert.equal(Profile.get().name, 'Ziad Amr')

  const second = Profile.upsert({
    name: 'Ziad Amr',
    major: 'Data Science',
    skills: ['Python', 'SQL', 'React'],
  })
  assert.ok(second) // re-validated on every upsert
  assert.equal(Profile.get().major, 'Data Science')
  assert.deepEqual(Profile.get().skills, ['Python', 'SQL', 'React'])

  closeDatabase()
  initDatabase({ path: dbPath })
  assert.equal(Profile.get().name, 'Ziad Amr', 'profile must survive a connection reopen')
})

// --- Sprint 09 N1/N2 — explicit null hardening at the model layer ---------------

test('Task rejects a literal null title and never persists the string "null"', () => {
  assert.throws(
    () => Task.create({ title: null }),
    (error) => error instanceof ValidationError && error.message.includes('title'),
  )

  const created = Task.create({ title: 'Keep me' })
  assert.throws(
    () => Task.update(created.id, { title: null }),
    (error) => error instanceof ValidationError && error.message.includes('title'),
  )
  assert.equal(Task.findById(created.id).title, 'Keep me', 'stored title is untouched after a rejected null update')
})

test('Task accepts an explicit null dueDate to clear the optional value', () => {
  const created = Task.create({ title: 'Plan week', dueDate: '2026-09-30T00:00:00.000Z' })
  assert.equal(created.dueDate, '2026-09-30T00:00:00.000Z')

  const cleared = Task.update(created.id, { dueDate: null })
  assert.equal(cleared.dueDate, null)
  assert.equal(Task.findById(created.id).dueDate, null)
})

test('Note rejects null title/content and accepts null to clear the optional category', () => {
  assert.throws(() => Note.create({ title: null, content: 'x' }), ValidationError)
  assert.throws(() => Note.create({ title: 'x', content: null }), ValidationError)

  const created = Note.create({ title: 'A note', content: 'body', category: 'React' })
  assert.throws(() => Note.update(created.id, { title: null }), ValidationError)
  assert.equal(Note.findById(created.id).title, 'A note')

  const cleared = Note.update(created.id, { category: null })
  assert.equal(cleared.category, undefined, 'explicit null clears an optional category')
})

test('Resource rejects null title/url and accepts null to clear the optional description', () => {
  assert.throws(
    () => Resource.create({ title: null, url: 'https://example.com', category: 'article' }),
    ValidationError,
  )
  assert.throws(
    () => Resource.create({ title: 'Docs', url: null, category: 'article' }),
    ValidationError,
  )
  assert.throws(() => Resource.update('some-id', { url: null }), ValidationError)

  const created = Resource.create({
    title: 'Docs',
    url: 'https://example.com',
    category: 'article',
    description: 'desc',
  })
  const cleared = Resource.update(created.id, { description: null })
  assert.equal(cleared.description, undefined, 'explicit null clears an optional description')
})

test('Learning rejects null on NOT NULL fields while nullable numerics keep stored values', () => {
  const required = { title: 'X', category: 'book', status: 'not-started', progress: 0 }
  assert.throws(() => Learning.create({ ...required, relatedNotes: null }), ValidationError)
  assert.throws(() => Learning.create({ ...required, relatedResources: null }), ValidationError)
  assert.throws(() => Learning.create({ ...required, progress: null }), ValidationError)

  const created = Learning.create({ ...required, totalPages: 304 })
  assert.throws(() => Learning.update(created.id, { relatedNotes: null }), ValidationError)
  assert.equal(Learning.findById(created.id).totalPages, 304)

  const kept = Learning.update(created.id, { totalPages: null })
  assert.equal(
    kept.totalPages,
    304,
    'a null on a nullable numeric is accepted and preserves the stored value (numberOrUndefined semantics)',
  )
})

test('Profile rejects null name/skills and accepts null to clear optional text fields', () => {
  assert.throws(() => Profile.upsert({ name: null }), ValidationError)
  assert.throws(() => Profile.upsert({ name: 'Ziad', skills: null }), ValidationError)

  Profile.upsert({ name: 'Ziad', university: 'Cairo University', skills: ['React'] })
  const cleared = Profile.upsert({ name: 'Ziad', university: null })
  assert.equal(cleared.university, undefined, 'explicit null clears an optional profile field')
  assert.deepEqual(Profile.get().skills, ['React'])
})

// --- Sprint 11 phase 2 — free-text Task.category --------------------------------

test('Task category is free text: trimmed on write, absent when empty, case preserved', () => {
  const created = Task.create({ title: 'Revise graphs', category: '  Exam prep  ' })
  assert.equal(created.category, 'Exam prep', 'surrounding whitespace is trimmed')
  assert.equal(Task.findById(created.id).category, 'Exam prep', 'the trimmed value round-trips')

  // Free text means case is the user's label, not a normalized key.
  const mixedCase = Task.create({ title: 'Revise OS', category: 'Algorithms' })
  assert.equal(Task.findById(mixedCase.id).category, 'Algorithms')

  // An empty or whitespace-only category is "no category", never an empty string.
  for (const [index, value] of ['   ', '', null].entries()) {
    const task = Task.create({ title: `Blank ${index}`, category: value })
    assert.equal(task.category, undefined, `category ${JSON.stringify(value)} must be absent`)
    assert.equal(
      Task.findById(task.id).category,
      undefined,
      'a stored NULL must read back as undefined (safe-by-default)',
    )
  }

  // Omitting the field entirely is equally safe.
  const omitted = Task.create({ title: 'No category at all' })
  assert.equal(omitted.category, undefined)
})

test('Task category validates as a bounded optional free-text string', () => {
  assert.throws(
    () => Task.create({ title: 'Bad category type', category: 42 }),
    (error) => error instanceof ValidationError && error.message.includes('category'),
  )
  assert.throws(
    () => Task.create({ title: 'Long category', category: 'x'.repeat(61) }),
    (error) => error instanceof ValidationError && error.message.includes('category'),
  )
  assert.equal(Task.findAll().length, 0, 'a rejected payload must not persist a partial row')

  const atLimit = Task.create({ title: 'Category at the limit', category: 'x'.repeat(60) })
  assert.equal(atLimit.category.length, 60)
})

test('Task category can be edited and cleared, and an absent patch preserves it', () => {
  const created = Task.create({ title: 'Draft lab report', category: 'Labs' })

  const renamed = Task.update(created.id, { category: '  Labs 2026  ' })
  assert.equal(renamed.category, 'Labs 2026')
  assert.equal(Task.findById(created.id).category, 'Labs 2026')

  // An explicit null clears the value (the clear contract the form relies on).
  const clearedByNull = Task.update(created.id, { category: null })
  assert.equal(clearedByNull.category, undefined)
  assert.equal(Task.findById(created.id).category, undefined)

  // An explicit empty string clears it too, and is normalized to absent.
  Task.update(created.id, { category: 'Labs' })
  const clearedByEmpty = Task.update(created.id, { category: '' })
  assert.equal(clearedByEmpty.category, undefined)
  assert.equal(Task.findById(created.id).category, undefined)

  // A partial update that does not mention category leaves it untouched, and
  // null is rejected for a non-nullable field without touching the row.
  Task.update(created.id, { category: 'Labs' })
  const statusOnly = Task.update(created.id, { status: 'in-progress' })
  assert.equal(statusOnly.category, 'Labs', 'an unrelated field must not clear the category')
  assert.equal(Task.findById(created.id).category, 'Labs')
})

test('Task create-by-id stays idempotent with a category and never duplicates', () => {
  const id = '11111111-2222-3333-4444-555555555555'
  const first = Task.create({ id, title: 'Imported task', category: 'Imported' })
  assert.equal(first.category, 'Imported')

  // A retried migration must not overwrite the stored category.
  const second = Task.create({ id, title: 'Imported task', category: 'Different' })
  assert.equal(second.category, 'Imported')
  assert.equal(Task.findAll().length, 1)
})