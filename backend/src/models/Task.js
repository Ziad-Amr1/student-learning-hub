import { createStore } from '../data/store.js'
import { newId } from '../utils/id.js'

const store = createStore('tasks.json')

export const TASK_STATUSES = ['unstarted', 'in-progress', 'deferred', 'done', 'cancelled']
export const TASK_PRIORITIES = ['low', 'medium', 'high']

// Legacy persisted alias (Sprint 07.5): stored 'todo' reads/display as
// 'unstarted'. No migration script — only rewritten when the task is saved.
const LEGACY_STATUS_ALIASES = { todo: 'unstarted' }

export const normalizeTaskStatus = (status) => LEGACY_STATUS_ALIASES[status] ?? status

// Shared validation rules used by routes via middleware/validate.js.
// `required` fields are enforced on POST; PUT validates only provided fields.
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

// `input` may carry a preserved `id` (one-time migration); otherwise the
// backend assigns a fresh id.
export function create(input) {
  const task = buildTask(input)
  return store.insert(task)
}

export function update(id, input) {
  const existing = store.findById(id)
  if (!existing) return null
  const updated = buildTask(input, existing)
  return store.update(id, updated)
}

export function remove(id) {
  return store.remove(id)
}
