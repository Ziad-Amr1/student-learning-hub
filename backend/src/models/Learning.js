import { createStore } from '../data/store.js'
import { newId } from '../utils/id.js'
import { validateAgainst } from '../utils/validate.js'
import { ValidationError } from '../utils/ValidationError.js'

const store = createStore('learning.json')

// Shared domain validation rules — owned by the Model and enforced by it in
// create()/update(). `required` fields are enforced on create; update
// (partial) validates only the provided fields.
export const LEARNING_CATEGORIES = ['course', 'book', 'practice', 'video', 'topic']
export const LEARNING_STATUSES = ['not-started', 'in-progress', 'paused', 'completed']

export const LEARNING_RULES = [
  { field: 'title', required: true, type: 'string', max: 120, message: "'title' is required and must be a non-empty string (max 120 characters)." },
  { field: 'category', required: true, type: 'string', oneOf: LEARNING_CATEGORIES, message: "'category' is required and must be one of: course, book, practice, video, topic." },
  { field: 'status', required: true, type: 'string', oneOf: LEARNING_STATUSES, message: "'status' is required and must be one of: not-started, in-progress, paused, completed." },
  { field: 'progress', required: true, type: 'number', message: "'progress' is required and must be a number." },
  { field: 'pinned', type: 'boolean' },
  { field: 'targetHours', type: 'number', min: 0 },
  { field: 'completedHours', type: 'number', min: 0 },
  { field: 'totalPages', type: 'number', min: 0 },
  { field: 'videoMinutes', type: 'number', min: 0 },
  { field: 'relatedNotes', arrayOf: 'string' },
  { field: 'relatedResources', arrayOf: 'string' },
]

// Content fields (a change to any of these is a "content edit" and refreshes
// updatedAt). A pin toggle alone is an organization action and does NOT bump
// updatedAt (Notes/Resources precedent, Sprint 07.6 refinement).
const CONTENT_FIELDS = [
  'title',
  'category',
  'status',
  'progress',
  'targetHours',
  'completedHours',
  'totalPages',
  'videoMinutes',
  'relatedNotes',
  'relatedResources',
]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function trim(value) {
  return typeof value === 'string' ? value.trim() : value
}

function numberOrUndefined(value, existing) {
  if (value === undefined || value === null || value === '') return existing ?? undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

// Deterministic status <-> progress normalization — the single source for the
// learning invariant (mirrors utils/learning.js normalizeLearningEntry):
//  - status === 'completed'  forces progress to 100 (status wins)
//  - progress >= 100         normalizes the entry to completed
//  - progress is clamped to the 0-100 range
function normalizeProgressStatus(status, progress) {
  const clamped = clamp(Number(progress) || 0, 0, 100)
  if (status === 'completed') return { status, progress: 100 }
  if (clamped >= 100) return { status: 'completed', progress: 100 }
  return { status, progress: clamped }
}

// Normalize a stored LearningEntry into its canonical read shape. Backend
// writes are canonical (already normalized), so this only fills optional
// defaults and preserves timestamps exactly — reads never mutate data.
function fromStored(entry) {
  return {
    id: entry.id,
    title: entry.title || '',
    category: entry.category || 'topic',
    status: entry.status || 'not-started',
    progress: Number(entry.progress) || 0,
    pinned: Boolean(entry.pinned),
    targetHours: entry.targetHours ?? undefined,
    completedHours: entry.completedHours ?? undefined,
    totalPages: entry.totalPages ?? undefined,
    videoMinutes: entry.videoMinutes ?? undefined,
    relatedNotes: Array.isArray(entry.relatedNotes) ? entry.relatedNotes : [],
    relatedResources: Array.isArray(entry.relatedResources) ? entry.relatedResources : [],
    startedAt: entry.startedAt ?? null,
    completedAt: entry.completedAt ?? null,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }
}

// Build a normalized LearningEntry for create/update from raw input + an
// optional existing record. Server-managed fields (id, createdAt) are never
// replaced by client input, except the initial `id` preserved during a one-time
// migration. startedAt/completedAt transitions are OWNED by the model (never
// trusted from the client): startedAt is set on entry to `in-progress` and
// cleared when returning to `not-started`; completedAt is set when entering
// `completed` and cleared when edited away.
function buildLearning(input, existing = null) {
  const hasExisting = existing !== null
  const now = new Date().toISOString()

  const title = input.title !== undefined ? trim(input.title) : hasExisting ? existing.title : ''
  const category =
    input.category !== undefined ? trim(input.category) : hasExisting ? existing.category : 'topic'
  const status = input.status !== undefined ? trim(input.status) : hasExisting ? existing.status : 'not-started'
  const { status: nextStatus, progress: nextProgress } = normalizeProgressStatus(
    status,
    input.progress !== undefined ? input.progress : hasExisting ? existing.progress : 0
  )
  const pinned = input.pinned !== undefined ? Boolean(input.pinned) : hasExisting ? existing.pinned : false

  const targetHours = numberOrUndefined(input.targetHours, hasExisting ? existing.targetHours : undefined)
  const completedHours = numberOrUndefined(input.completedHours, hasExisting ? existing.completedHours : undefined)
  const totalPages = numberOrUndefined(input.totalPages, hasExisting ? existing.totalPages : undefined)
  const videoMinutes = numberOrUndefined(input.videoMinutes, hasExisting ? existing.videoMinutes : undefined)
  const relatedNotes = input.relatedNotes !== undefined ? input.relatedNotes : hasExisting ? existing.relatedNotes : []
  const relatedResources =
    input.relatedResources !== undefined ? input.relatedResources : hasExisting ? existing.relatedResources : []

  const id = hasExisting ? existing.id : typeof input.id === 'string' && input.id ? input.id : newId()
  const createdAt = hasExisting ? existing.createdAt : now

  let startedAt = hasExisting ? existing.startedAt : null
  let completedAt = hasExisting ? existing.completedAt : null

  if (!hasExisting) {
    if (nextStatus === 'in-progress') startedAt = now
    if (nextStatus === 'completed') completedAt = now
  } else {
    if (nextStatus === 'in-progress' && !existing.startedAt) startedAt = now
    if (nextStatus === 'not-started') startedAt = null
    completedAt = nextStatus === 'completed' ? (existing.completedAt ?? now) : null
  }

  const isContentEdit = CONTENT_FIELDS.some((field) => input[field] !== undefined)
  const updatedAt = !hasExisting ? now : isContentEdit ? now : existing.updatedAt

  return {
    id,
    title,
    category,
    status: nextStatus,
    progress: nextProgress,
    pinned,
    targetHours,
    completedHours,
    totalPages,
    videoMinutes,
    relatedNotes,
    relatedResources,
    startedAt,
    completedAt,
    createdAt,
    updatedAt,
  }
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
  const errors = validateAgainst(LEARNING_RULES, input, { partial: false })
  if (errors.length > 0) throw new ValidationError(errors)

  const entry = buildLearning(input)

  if (entry.id) {
    const existing = findById(entry.id)
    if (existing) return existing
  }

  return store.insert(entry)
}

// Partial update — validates only provided fields, merges onto the stored
// record. Returns null when the id is unknown (controller maps that to 404).
export function update(id, input) {
  const errors = validateAgainst(LEARNING_RULES, input, { partial: true })
  if (errors.length > 0) throw new ValidationError(errors)

  const existing = store.findById(id)
  if (!existing) return null

  const updated = buildLearning(input, existing)
  return store.update(id, updated)
}

export function remove(id) {
  return store.remove(id)
}
