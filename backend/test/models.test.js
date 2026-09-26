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