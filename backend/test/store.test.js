import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { initDatabase, closeDatabase } from '../src/db/init.js'
import { createStore } from '../src/data/store.js'

let dir
let dbPath

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'huby-store-'))
  dbPath = join(dir, 'test.db')
  initDatabase({ path: dbPath })
})

afterEach(() => {
  closeDatabase()
  rmSync(dir, { recursive: true, force: true })
})

const tasks = createStore('tasks')
const notes = createStore('notes')
const resources = createStore('resources')
const learning = createStore('learning')
const profile = createStore('profile')

const TASK_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

function sampleTask() {
  return {
    id: TASK_ID,
    title: 'Finish React hooks exercise',
    description: 'Complete exercises 3–5 from chapter 7.',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-08-26T00:00:00.000Z',
    createdAt: '2026-08-22T10:12:00.000Z',
  }
}

test('insert then findAll and findById round-trip a record and preserve its id', () => {
  const task = sampleTask()
  const inserted = tasks.insert(task)
  assert.equal(inserted, task)

  const all = tasks.findAll()
  assert.equal(all.length, 1)
  assert.equal(all[0].id, TASK_ID)
  assert.equal(all[0].title, task.title)
  assert.equal(all[0].status, 'in-progress')

  const found = tasks.findById(TASK_ID)
  assert.equal(found.id, TASK_ID)
  assert.equal(found.description, task.description)
  assert.equal(found.dueDate, task.dueDate)
  assert.equal(found.createdAt, task.createdAt)
})

test('findById returns null for an unknown id', () => {
  tasks.insert(sampleTask())
  assert.equal(tasks.findById('does-not-exist'), null)
})

test('update merges changes, preserves the id, and returns the updated record', () => {
  tasks.insert(sampleTask())
  const updated = tasks.update(TASK_ID, { ...sampleTask(), status: 'done', priority: 'low' })
  assert.equal(updated.id, TASK_ID)
  assert.equal(updated.status, 'done')
  assert.equal(updated.priority, 'low')
  assert.equal(tasks.findById(TASK_ID).status, 'done')
  assert.equal(tasks.findAll().length, 1)
})

test('update returns null for an unknown id', () => {
  assert.equal(tasks.update('missing', sampleTask()), null)
})

test('remove deletes a record and reports not-found afterwards', () => {
  tasks.insert(sampleTask())
  assert.equal(tasks.remove(TASK_ID), true)
  assert.equal(tasks.remove(TASK_ID), false)
  assert.equal(tasks.findAll().length, 0)
})

test('JSON-array fields round-trip as real JS arrays (learning)', () => {
  const entry = {
    id: '6fb24a9e-0d3c-4b2a-9e7f-3c4d5e6f7081',
    title: 'The Odin Project — React path',
    category: 'course',
    status: 'in-progress',
    progress: 62,
    pinned: false,
    targetHours: 120,
    completedHours: 74,
    totalPages: null,
    videoMinutes: null,
    relatedNotes: ['a3f1c8e2-7b44-4d91-b5e6-1a2c3d4e5f60'],
    relatedResources: ['e1f3a5b7-9c24-4d86-a0e2-3f4c5d6e7f80'],
    startedAt: '2026-08-10T09:00:00.000Z',
    completedAt: null,
    createdAt: '2026-08-10T09:00:00.000Z',
    updatedAt: '2026-08-22T20:00:00.000Z',
  }
  learning.insert(entry)

  const found = learning.findById(entry.id)
  assert.ok(Array.isArray(found.relatedNotes), 'relatedNotes must deserialize to an array')
  assert.deepEqual(found.relatedNotes, entry.relatedNotes)
  assert.deepEqual(found.relatedResources, entry.relatedResources)

  const all = learning.findAll()
  assert.ok(Array.isArray(all[0].relatedResources))
  assert.deepEqual(all[0].relatedNotes, entry.relatedNotes)
})

test('booleans round-trip through INTEGER 0/1 columns', () => {
  notes.insert({
    id: 'c92e1d12-0000-0000-0000-000000000001',
    title: 'Router notes',
    content: 'NavLink gets aria-current automatically.',
    category: 'React',
    pinned: true,
    createdAt: '2026-08-21T09:00:00.000Z',
    updatedAt: '2026-08-22T18:30:00.000Z',
  })
  resources.insert({
    id: 'f70a2c34-0000-0000-0000-000000000002',
    title: 'Thinking in React',
    url: 'https://react.dev/learn/thinking-in-react',
    category: 'article',
    description: 'Guide to structuring React apps.',
    pinned: false,
    createdAt: '2026-08-01T12:00:00.000Z',
  })

  const note = notes.findById('c92e1d12-0000-0000-0000-000000000001')
  assert.equal(note.pinned, 1)
  assert.equal(Boolean(note.pinned), true)

  const resource = resources.findById('f70a2c34-0000-0000-0000-000000000002')
  assert.equal(resource.pinned, 0)
  assert.equal(Boolean(resource.pinned), false)
})

test('undefined optional fields are stored as NULL and returned as null', () => {
  notes.insert({
    id: 'c92e1d12-0000-0000-0000-000000000003',
    title: 'No category',
    content: 'Optional fields may be absent.',
    category: undefined,
    pinned: false,
    createdAt: '2026-08-21T09:00:00.000Z',
    updatedAt: '2026-08-22T18:30:00.000Z',
  })
  const note = notes.findById('c92e1d12-0000-0000-0000-000000000003')
  assert.equal(note.category, null)
})

test('values are bound via parameters, not interpolated into SQL', () => {
  const hostile = {
    id: 'deadbeef-0000-0000-0000-000000000004',
    title: "'; DROP TABLE notes; --",
    description: "SELECT 'x'",
    priority: 'high',
    status: 'unstarted',
    dueDate: null,
    createdAt: '2026-08-22T10:12:00.000Z',
  }
  tasks.insert(hostile)
  assert.equal(tasks.findAll().length, 1)
  assert.equal(tasks.findById(hostile.id).title, hostile.title)
  assert.equal(notes.findAll().length, 0, 'notes table must stay intact')
})

test('profile singleton row can be inserted and updated by its fixed id', () => {
  const saved = profile.insert({
    id: 'profile',
    name: 'Ziad Amr',
    avatarUrl: '',
    university: 'Cairo University',
    major: 'Computer Science',
    bio: 'Frontend-focused CS student.',
    skills: ['React', 'JavaScript', 'CSS'],
  })
  assert.equal(saved.id, 'profile')
  assert.deepEqual(profile.findAll()[0].skills, ['React', 'JavaScript', 'CSS'])

  const updated = profile.update('profile', {
    id: 'profile',
    name: 'Ziad Amr',
    avatarUrl: '',
    university: 'Cairo University',
    major: 'Data Science',
    bio: 'Now data-focused.',
    skills: ['Python', 'SQL'],
  })
  assert.equal(updated.id, 'profile')
  const all = profile.findAll()
  assert.equal(all.length, 1)
  assert.equal(all[0].major, 'Data Science')
  assert.deepEqual(all[0].skills, ['Python', 'SQL'])
})

test('inserting a duplicate id is rejected by the primary key', () => {
  tasks.insert(sampleTask())
  assert.throws(() => tasks.insert(sampleTask()))
  assert.equal(tasks.findAll().length, 1)
})