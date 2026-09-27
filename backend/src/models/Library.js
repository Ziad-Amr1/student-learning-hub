import { createStore } from '../data/store.js'
import { newId } from '../utils/id.js'
import { validateAgainst } from '../utils/validate.js'
import { ValidationError } from '../utils/ValidationError.js'

// My Library book domain — the user's personal relationship with a book
// (status, progress, rating, notes, quotes, reading dates) plus OPTIONAL
// one-way ID references to Resources / Learning entries. Library is NOT a
// Resource and NOT a Learning goal; those domains stay untouched and the
// links are outgoing-only + dangling-tolerant (see docs/MY_LIBRARY_SCOPE.md
// §5). Mirrors the Learning model's shape/validation/timestamp ownership.

const store = createStore('library')

export const LIBRARY_STATUSES = ['want-to-read', 'reading', 'finished', 'dnf']

export const LIBRARY_RULES = [
  { field: 'title', required: true, type: 'string', max: 120, message: "'title' is required and must be a non-empty string (max 120 characters)." },
  { field: 'author', type: 'string', max: 120, nullable: true, message: "'author' must be a string (max 120 characters)." },
  { field: 'status', required: true, type: 'string', oneOf: LIBRARY_STATUSES, message: "'status' is required and must be one of: want-to-read, reading, finished, dnf." },
  { field: 'progress', required: true, type: 'number', min: 0, max: 100, message: "'progress' is required and must be a number between 0 and 100." },
  { field: 'rating', type: 'number', min: 0, max: 5, nullable: true, message: "'rating' must be a number between 0 and 5." },
  { field: 'totalPages', type: 'number', min: 1, nullable: true, message: "'totalPages' must be a positive whole number of pages." },
  { field: 'notes', type: 'string', nullable: true },
  { field: 'quotes', arrayOf: 'string' },
  { field: 'relatedResourceIds', arrayOf: 'string' },
  { field: 'relatedLearningIds', arrayOf: 'string' },
]

// Content fields (a change to any of these is a "content edit" and refreshes
// updatedAt). Library has no pin in MVP, so every editable field is content.
const CONTENT_FIELDS = [
  'title',
  'author',
  'status',
  'progress',
  'rating',
  'totalPages',
  'notes',
  'quotes',
  'relatedResourceIds',
  'relatedLearningIds',
]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function trim(value) {
  return typeof value === 'string' ? value.trim() : value
}

function textOrNull(value) {
  if (value === undefined || value === null) return null
  const trimmed = trim(value)
  return trimmed === '' ? null : trimmed
}

// Clears an optional numeric field when the client explicitly sends null/empty;
// preserves the existing value when the field is simply absent.
function numberOrNull(value, existing) {
  if (value === undefined) return existing ?? null
  if (value === null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

// Optional page count. Unlike `rating`, a page count is only meaningful as a
// whole number, so a fractional value is rejected rather than silently rounded
// (the UI validates this too, but the model is the authority). Absent / null /
// empty clears it; undefined preserves the stored value.
function positiveIntOrNull(value, existing) {
  if (value === undefined) return existing ?? null
  if (value === null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.trunc(parsed) > 0 ? Math.trunc(parsed) : null
}

// Deterministic status <-> progress normalization — mirrors the Learning
// invariant: status === 'finished' forces progress 100 (status wins);
// progress >= 100 normalizes the book to finished; progress is always clamped
// to 0-100. `dnf` does NOT force progress (a stopped book can be anywhere).
function normalizeProgressStatus(status, progress) {
  const clamped = clamp(Number(progress) || 0, 0, 100)
  if (status === 'finished') return { status, progress: 100 }
  if (clamped >= 100) return { status: 'finished', progress: 100 }
  return { status, progress: clamped }
}

// Normalize a stored book into its canonical read shape. Backend writes are
// canonical, so this only fills optional defaults and preserves timestamps
// exactly — reads never mutate data.
function fromStored(entry) {
  return {
    id: entry.id,
    title: entry.title || '',
    author: entry.author ?? null,
    status: entry.status || 'want-to-read',
    progress: Number(entry.progress) || 0,
    rating: entry.rating ?? null,
    totalPages: entry.totalPages ?? null,
    notes: entry.notes ?? null,
    quotes: Array.isArray(entry.quotes) ? entry.quotes : [],
    relatedResourceIds: Array.isArray(entry.relatedResourceIds) ? entry.relatedResourceIds : [],
    relatedLearningIds: Array.isArray(entry.relatedLearningIds) ? entry.relatedLearningIds : [],
    startedAt: entry.startedAt ?? null,
    finishedAt: entry.finishedAt ?? null,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }
}

// Build a normalized book for create/update from raw input + an optional
// existing record. Server-managed fields (id, createdAt) are never replaced
// by client input, except the initial `id` preserved during a one-time
// migration. startedAt / finishedAt transitions are OWNED by the model:
// startedAt is set on entry to `reading` and cleared back to `want-to-read`;
// finishedAt is set when entering `finished` / `dnf` and cleared when the
// status is edited out of an ending state.
function buildLibrary(input, existing = null) {
  const hasExisting = existing !== null
  const now = new Date().toISOString()

  const title = input.title !== undefined ? trim(input.title) : hasExisting ? existing.title : ''
  const author = input.author !== undefined ? textOrNull(input.author) : hasExisting ? existing.author ?? null : null
  const status = input.status !== undefined ? trim(input.status) : hasExisting ? existing.status : 'want-to-read'
  const { status: nextStatus, progress: nextProgress } = normalizeProgressStatus(
    status,
    input.progress !== undefined ? input.progress : hasExisting ? existing.progress : 0
  )
  const rating =
    input.rating !== undefined ? numberOrNull(input.rating, hasExisting ? existing.rating : null) : hasExisting ? existing.rating ?? null : null
  const totalPages =
    input.totalPages !== undefined
      ? positiveIntOrNull(input.totalPages, hasExisting ? existing.totalPages : null)
      : hasExisting
        ? existing.totalPages ?? null
        : null
  const notes = input.notes !== undefined ? textOrNull(input.notes) : hasExisting ? existing.notes ?? null : null
  const quotes = input.quotes !== undefined ? input.quotes : hasExisting ? existing.quotes : []
  const relatedResourceIds =
    input.relatedResourceIds !== undefined ? input.relatedResourceIds : hasExisting ? existing.relatedResourceIds : []
  const relatedLearningIds =
    input.relatedLearningIds !== undefined ? input.relatedLearningIds : hasExisting ? existing.relatedLearningIds : []

  const id = hasExisting ? existing.id : typeof input.id === 'string' && input.id ? input.id : newId()
  const createdAt = hasExisting ? existing.createdAt : now

  let startedAt = hasExisting ? existing.startedAt : null
  let finishedAt = hasExisting ? existing.finishedAt : null
  const isEndingState = nextStatus === 'finished' || nextStatus === 'dnf'

  if (!hasExisting) {
    if (nextStatus === 'reading') startedAt = now
    if (isEndingState) finishedAt = now
  } else {
    if (nextStatus === 'reading' && !existing.startedAt) startedAt = now
    if (nextStatus === 'want-to-read') startedAt = null
    finishedAt = isEndingState ? (existing.finishedAt ?? now) : null
  }

  const isContentEdit = CONTENT_FIELDS.some((field) => input[field] !== undefined)
  const updatedAt = !hasExisting ? now : isContentEdit ? now : existing.updatedAt

  return {
    id,
    title,
    author,
    status: nextStatus,
    progress: nextProgress,
    rating,
    totalPages,
    notes,
    quotes,
    relatedResourceIds,
    relatedLearningIds,
    startedAt,
    finishedAt,
    createdAt,
    updatedAt,
  }
}

// Domain rules `validateAgainst` cannot express (it has no integer type).
// A page count must be a WHOLE number of pages: a fractional value is a client
// mistake, not something to silently round, so it is rejected here and the
// caller gets a 400. Runs on both create and partial update, and only when the
// field is actually being provided. Absent / null / empty is legal — page
// tracking is optional and clearing it is a supported operation.
function validateDomain(input) {
  const value = input.totalPages
  if (value === undefined || value === null || value === '') return []
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || Number.isInteger(parsed)) return []
  return ["'totalPages' must be a whole number of pages."]
}

function collectErrors(input, options) {
  return [...validateAgainst(LIBRARY_RULES, input, options), ...validateDomain(input)]
}

export function findAll() {
  return store.findAll().map(fromStored)
}

export function findById(id) {
  const entry = store.findById(id)
  return entry ? fromStored(entry) : null
}

// Domain create — validates, then persists. Create-by-id is IDEMPOTENT so a
// retried migration fills only the gaps (never duplicates).
export function create(input) {
  const errors = collectErrors(input, { partial: false })
  if (errors.length > 0) throw new ValidationError(errors)

  const entry = buildLibrary(input)

  if (entry.id) {
    const existing = findById(entry.id)
    if (existing) return existing
  }

  return store.insert(entry)
}

// Partial update — validates only provided fields, merges onto the stored
// record. Returns null when the id is unknown (controller maps that to 404).
export function update(id, input) {
  const errors = collectErrors(input, { partial: true })
  if (errors.length > 0) throw new ValidationError(errors)

  const existing = store.findById(id)
  if (!existing) return null

  const updated = buildLibrary(input, existing)
  return store.update(id, updated)
}

export function remove(id) {
  return store.remove(id)
}