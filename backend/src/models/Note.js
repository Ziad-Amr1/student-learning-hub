import { createStore } from '../data/store.js'
import { newId } from '../utils/id.js'
import { validateAgainst } from '../utils/validate.js'
import { ValidationError } from '../utils/ValidationError.js'

const store = createStore('notes.json')

// Shared domain validation rules — owned by the Model and enforced by it in
// create()/update(). `required` fields are enforced on create; update
// (partial) validates only the provided fields.
export const NOTE_RULES = [
  { field: 'title', required: true, type: 'string', max: 120, message: "'title' is required and must be a non-empty string (max 120 characters)." },
  { field: 'content', required: true, type: 'string', message: "'content' is required and must be a non-empty string." },
  { field: 'category', type: 'string', max: 60 },
  { field: 'pinned', type: 'boolean' },
]

function trim(value) {
  return typeof value === 'string' ? value.trim() : value
}

// Normalize a stored Note into its canonical read shape. Preserves every field
// including the timestamps exactly (reads must never mutate data).
function fromStored(note) {
  return {
    id: note.id,
    title: note.title || '',
    content: note.content || '',
    category: note.category || undefined,
    pinned: Boolean(note.pinned),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }
}

// Build a normalized Note for create/update from raw input + an optional
// existing record. Server-managed fields (id, createdAt) are never replaced by
// client input, except the initial `id` which is preserved during a one-time
// migration. `updatedAt` is refreshed on any content edit but intentionally NOT
// on a pin toggle (organization action, not a content edit — Notes precedent).
function buildNote(input, existing = null) {
  const hasExisting = existing !== null
  const title = input.title !== undefined ? trim(input.title) : hasExisting ? existing.title : ''
  const content = input.content !== undefined ? trim(input.content) : hasExisting ? existing.content : ''
  const category =
    input.category !== undefined
      ? trim(input.category) || undefined
      : hasExisting
        ? existing.category
        : undefined
  const pinned =
    input.pinned !== undefined ? Boolean(input.pinned) : hasExisting ? existing.pinned : false
  const id = hasExisting ? existing.id : typeof input.id === 'string' && input.id ? input.id : newId()
  const createdAt = hasExisting ? existing.createdAt : new Date().toISOString()
  const updatedAt = !hasExisting
    ? new Date().toISOString()
    : input.pinned === undefined
      ? new Date().toISOString()
      : existing.updatedAt

  return { id, title, content, category, pinned, createdAt, updatedAt }
}

export function findAll() {
  return store.findAll().map(fromStored)
}

export function findById(id) {
  const note = store.findById(id)
  return note ? fromStored(note) : null
}

// Domain create — validates, then persists. Create-by-id is IDEMPOTENT so a
// retried migration fills only the gaps (never duplicates).
export function create(input) {
  const errors = validateAgainst(NOTE_RULES, input, { partial: false })
  if (errors.length > 0) throw new ValidationError(errors)

  const note = buildNote(input)

  if (note.id) {
    const existing = findById(note.id)
    if (existing) return existing
  }

  return store.insert(note)
}

// Partial update — validates only provided fields, merges onto the stored
// record. Returns null when the id is unknown (controller maps that to 404).
export function update(id, input) {
  const errors = validateAgainst(NOTE_RULES, input, { partial: true })
  if (errors.length > 0) throw new ValidationError(errors)

  const existing = store.findById(id)
  if (!existing) return null

  const updated = buildNote(input, existing)
  return store.update(id, updated)
}

export function remove(id) {
  return store.remove(id)
}
