import { createStore } from '../data/store.js'
import { newId } from '../utils/id.js'
import { validateAgainst } from '../utils/validate.js'
import { ValidationError } from '../utils/ValidationError.js'

const store = createStore('tasks.json')

export const TASK_STATUSES = ['unstarted', 'in-progress', 'deferred', 'done', 'cancelled']
export const TASK_PRIORITIES = ['low', 'medium', 'high']

// Legacy persisted alias (Sprint 07.5): stored 'todo' reads/display as
// 'unstarted'. The HTTP/domain path rejects 'todo' as non-canonical; the
// frontend one-time migration normalizes it to 'unstarted' before sending.
const LEGACY_STATUS_ALIASES = { todo: 'unstarted' }

export const normalizeTaskStatus = (status) => LEGACY_STATUS_ALIASES[status] ?? status

// Shared domain validation rules — owned by the Model and enforced by it in
// create()/update(). `required` fields are enforced on create; update (partial)
// validates only the provided fields.
export const TASK_RULES = [
  { field: 'title', required: true, type: 'string', max: 120, message: "'title' is required and must be a non-empty string (max 120 characters)." },
  { field: 'description', type: 'string' },
  { field: 'priority', type: 'string', oneOf: TASK_PRIORITIES },
  { field: 'status', type: 'string', oneOf: TASK_STATUSES },
  { field: 'dueDate', type: 'string' },
]

function toDate(value) {
  if (value === null || value === undefined || value === '') return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// Build a normalized Task from raw input + an optional existing record.
// Server-managed fields (id, createdAt) are never replaced by client input,
// except the initial `id` which is preserved during a one-time migration.
function buildTask(input, existing = null) {
  const hasExisting = existing !== null
  const title = input.title !== undefined ? String(input.title).trim() : hasExisting ? existing.title : ''
  const description =
    input.description !== undefined
      ? String(input.description ?? '')
      : hasExisting
        ? existing.description
        : ''
  const priority = input.priority ?? (hasExisting ? existing.priority : 'medium')
  const status = normalizeTaskStatus(input.status ?? (hasExisting ? existing.status : 'unstarted'))
  const dueDate =
    input.dueDate !== undefined
      ? toDate(input.dueDate)
      : hasExisting
        ? existing.dueDate
        : null
  const id = hasExisting ? existing.id : typeof input.id === 'string' && input.id ? input.id : newId()
  const createdAt = hasExisting ? existing.createdAt : new Date().toISOString()

  return { id, title, description, priority, status, dueDate, createdAt }
}

// Build a normalized Task from a full set of source fields (used on read).
function fromStored(task) {
  return buildTask({}, task)
}

export function findAll() {
  return store.findAll().map(fromStored)
}

export function findById(id) {
  const task = store.findById(id)
  return task ? fromStored(task) : null
}

// Domain create — the Model is the single authority for validity: it validates
// the payload, then persists. Invalid domain data can never reach the store,
// whether the call comes from the HTTP route, the one-time migration, or any
// future code path.
//
// `input` may carry a preserved `id` during a one-time migration; otherwise
// the backend assigns a fresh id (server-managed). Create-by-id is IDEMPOTENT:
// if a task with that id already exists the existing record is returned rather
// than inserting a duplicate. This makes retrying a partially failed migration
// deterministic (filled gaps only, never duplicates).
export function create(input) {
  const errors = validateAgainst(TASK_RULES, input, { partial: false })
  if (errors.length > 0) throw new ValidationError(errors)

  const task = buildTask(input)

  if (task.id) {
    const existing = findById(task.id)
    if (existing) return existing
  }

  return store.insert(task)
}

// Partial update — validates only the provided fields, merges onto the stored
// record, returns the normalized result. Returns null when the id is unknown
// (the caller/controller maps that to 404).
export function update(id, input) {
  const errors = validateAgainst(TASK_RULES, input, { partial: true })
  if (errors.length > 0) throw new ValidationError(errors)

  const existing = store.findById(id)
  if (!existing) return null

  const updated = buildTask(input, existing)
  return store.update(id, updated)
}

export function remove(id) {
  return store.remove(id)
}
