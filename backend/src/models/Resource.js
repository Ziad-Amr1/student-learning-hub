import { createStore } from '../data/store.js'
import { newId } from '../utils/id.js'
import { validateAgainst } from '../utils/validate.js'
import { ValidationError } from '../utils/ValidationError.js'

const store = createStore('resources.json')

export const RESOURCE_CATEGORIES = ['article', 'video', 'course', 'book', 'tool', 'other']

// Shared domain validation rules — owned by the Model and enforced by it in
// create()/update(). `required` fields are enforced on create; update
// (partial) validates only the provided fields.
export const RESOURCE_RULES = [
  { field: 'title', required: true, type: 'string', max: 120, message: "'title' is required and must be a non-empty string (max 120 characters)." },
  { field: 'url', required: true, type: 'string', format: 'url', message: "'url' is required and must be a valid http(s) URL." },
  { field: 'category', required: true, type: 'string', oneOf: RESOURCE_CATEGORIES, message: `'category' must be one of: ${RESOURCE_CATEGORIES.join(', ')}.` },
  { field: 'description', type: 'string', max: 500 },
  { field: 'pinned', type: 'boolean' },
]

function trim(value) {
  return typeof value === 'string' ? value.trim() : value
}

// Normalize a stored Resource into its canonical read shape (reads never mutate).
function fromStored(resource) {
  return {
    id: resource.id,
    title: resource.title || '',
    url: resource.url || '',
    category: resource.category,
    description: resource.description || undefined,
    pinned: Boolean(resource.pinned),
    createdAt: resource.createdAt,
  }
}

// Build a normalized Resource for create/update. Server-managed fields (id,
// createdAt) are never replaced by client input, except the initial `id`
// which is preserved during a one-time migration. Resources have no
// updatedAt (edits do not bump any timestamp — per DATA_MODEL).
function buildResource(input, existing = null) {
  const hasExisting = existing !== null
  const title = input.title !== undefined ? trim(input.title) : hasExisting ? existing.title : ''
  const url = input.url !== undefined ? trim(input.url) : hasExisting ? existing.url : ''
  const category = input.category ?? (hasExisting ? existing.category : undefined)
  const description =
    input.description !== undefined
      ? trim(input.description) || undefined
      : hasExisting
        ? existing.description
        : undefined
  const pinned =
    input.pinned !== undefined ? Boolean(input.pinned) : hasExisting ? existing.pinned : false
  const id = hasExisting ? existing.id : typeof input.id === 'string' && input.id ? input.id : newId()
  const createdAt = hasExisting ? existing.createdAt : new Date().toISOString()

  return { id, title, url, category, description, pinned, createdAt }
}

export function findAll() {
  return store.findAll().map(fromStored)
}

export function findById(id) {
  const resource = store.findById(id)
  return resource ? fromStored(resource) : null
}

// Domain create — validates, then persists. Create-by-id is IDEMPOTENT so a
// retried migration fills only the gaps (never duplicates).
export function create(input) {
  const errors = validateAgainst(RESOURCE_RULES, input, { partial: false })
  if (errors.length > 0) throw new ValidationError(errors)

  const resource = buildResource(input)

  if (resource.id) {
    const existing = findById(resource.id)
    if (existing) return existing
  }

  return store.insert(resource)
}

// Partial update — validates only provided fields, merges onto the stored
// record. Returns null when the id is unknown (controller maps that to 404).
export function update(id, input) {
  const errors = validateAgainst(RESOURCE_RULES, input, { partial: true })
  if (errors.length > 0) throw new ValidationError(errors)

  const existing = store.findById(id)
  if (!existing) return null

  const updated = buildResource(input, existing)
  return store.update(id, updated)
}

export function remove(id) {
  return store.remove(id)
}
