// Pure My Library helpers — no React/DOM dependency (ARCHITECTURE.md).
// Status ⇔ progress normalization is CENTRALIZED here (mirrors
// utils/learning.js): components never implement the progress<->status rule
// themselves. Transient sorting and end-state classification also live here.
import { resolveLinkedIds } from './learning.js'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// Deterministic status <-> progress normalization. Rules:
// - `status === 'finished'` forces `progress` to 100 (status wins).
// - `progress >= 100` normalizes the book to `finished`.
// - `progress` is always clamped to the 0-100 range.
// Returns the SAME object reference when nothing changed (render-friendly).
export function normalizeLibraryEntry(entry) {
  const { status } = entry
  const clampedProgress = clamp(Number(entry.progress) || 0, 0, 100)

  let nextStatus = status
  let nextProgress = clampedProgress

  if (nextStatus === 'finished') {
    nextProgress = 100
  } else if (nextProgress >= 100) {
    nextStatus = 'finished'
  }

  if (nextStatus !== status || nextProgress !== entry.progress) {
    return { ...entry, status: nextStatus, progress: nextProgress }
  }
  return entry
}

// A book reached an ending state — its "active" shelf presence is over.
export function isEnded(entry) {
  return entry.status === 'finished' || entry.status === 'dnf'
}

// --- Page-based reading progress (phase-0 decision 1, 2026-09-27) ---
// `progress` (0-100) REMAINS the single source of truth and the only stored
// progress value. `totalPages` is the optional page count a percentage is read
// against; `currentPages` is NEVER stored — it is always DERIVED here, so the
// two inputs can never disagree. Mode is therefore not persisted either: a book
// is in "pages" mode exactly when it has a `totalPages`.
//
// These helpers are pure and are the single place the page <-> percentage
// conversion lives (the form, the card caption, and the Learning goal creation
// all read them rather than recomputing).

// Reading pages -> percentage. Returns null when the input is not usable
// (missing total, non-positive total, or a non-numeric value) so callers can
// raise a field error instead of silently clamping. Valid input is bounded to
// 0-100 by the caller (currentPages > totalPages is a user error, surfaced by
// validatePageInput, NOT clamped here).
export function progressFromPages(currentPages, totalPages) {
  const current = Number(currentPages)
  const total = Number(totalPages)
  if (!Number.isFinite(current) || !Number.isFinite(total)) return null
  if (total <= 0) return null
  return clamp((current / total) * 100, 0, 100)
}

// Percentage -> reading pages. `null` when the book has no page count.
export function pagesFromProgress(entry) {
  const total = Number(entry?.totalPages)
  if (!Number.isFinite(total) || total <= 0) return null
  return clamp(Math.round(((Number(entry.progress) || 0) / 100) * total), 0, total)
}

// "X of Y pages" caption for a book that carries a page count; null otherwise
// (mirrors Learning's formatLearningUnits, which derives pages the same way).
export function formatPageProgress(entry) {
  const current = pagesFromProgress(entry)
  if (current === null) return null
  return `${current} of ${entry.totalPages} pages`
}

// Validate the two page inputs. Returns a field-keyed error map (empty when
// valid). Never clamps: an out-of-range current page is a user error that must
// be shown, not silently corrected. `progress` is returned by the caller, not
// here, so the same rules can validate either mode.
export function validatePageInput(currentPages, totalPages) {
  const errors = {}
  const totalRaw = String(totalPages ?? '').trim()
  const currentRaw = String(currentPages ?? '').trim()

  if (totalRaw === '') {
    // A cleared page count is a supported operation (leaves pages mode) — only
    // the now-orphaned current page becomes meaningless.
    if (currentRaw !== '') errors.currentPages = 'Enter a total page count first, or clear this field.'
    return errors
  }

  const total = Number(totalRaw)
  if (!Number.isFinite(total)) {
    errors.totalPages = 'Total pages must be a number.'
  } else if (!Number.isInteger(total)) {
    errors.totalPages = 'Total pages must be a whole number.'
  } else if (total <= 0) {
    errors.totalPages = 'Total pages must be greater than 0.'
  }

  if (currentRaw === '') return errors
  const current = Number(currentRaw)
  if (!Number.isFinite(current)) {
    errors.currentPages = 'Current page must be a number.'
  } else if (!Number.isInteger(current)) {
    errors.currentPages = 'Current page must be a whole number.'
  } else if (current < 0) {
    errors.currentPages = 'Current page cannot be negative.'
  } else if (Number.isFinite(total) && total > 0 && current > total) {
    errors.currentPages = `Current page cannot be more than the total (${total}).`
  }
  return errors
}

// Newest-first by updatedAt (widget preview lists).
export function sortLibraryByUpdatedAt(entries) {
  return [...entries].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

// Resolve stored IDs against a collection — RE-EXPORTED from utils/learning
// (generic helper, no Learning domain knowledge). Missing/deleted targets are
// silently omitted (dangling references never crash).
export { resolveLinkedIds }

// --- Transient sorting (mirrors utils/learning.js sortLearningEntries) ---
// Library has no pin in MVP, so "Manual order" is plain storage order.
// Sorts operate on copies only and are NOT persisted (transient toolbar
// state; the remote store value stays in storage order).

export const LIBRARY_SORT_OPTIONS = [
  { value: 'manual', label: 'Manual order' },
  { value: 'newest', label: 'Newest first' },
  { value: 'recent', label: 'Recently updated' },
  { value: 'rating', label: 'Rating' },
  { value: 'progress', label: 'Progress' },
  { value: 'title', label: 'Title A–Z' },
]

const compareNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
const compareRecent = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
const compareRating = (a, b) => (b.rating ?? -1) - (a.rating ?? -1)
const compareProgress = (a, b) => (b.progress ?? 0) - (a.progress ?? 0)
const compareTitle = (a, b) => a.title.localeCompare(b.title)

const compareByMode = (a, b, mode) => {
  switch (mode) {
    case 'newest':
      return compareNewest(a, b) || compareRecent(a, b)
    case 'rating':
      return compareRating(a, b) || compareRecent(a, b)
    case 'progress':
      return compareProgress(a, b) || compareRecent(a, b)
    case 'title':
      return compareTitle(a, b) || compareRecent(a, b)
    default:
      return compareRecent(a, b)
  }
}

export function sortLibraryEntries(entries, mode) {
  const list = [...entries]
  if (mode === 'manual' || mode === undefined) return list
  return list.sort((a, b) => compareByMode(a, b, mode))
}

// Reading dates caption: "Started <date>" and "Finished <date>" (or
// "Stopped <date>" for dnf) — rendered only when a date exists.
export function formatReadingDate(entry) {
  if (entry.startedAt && entry.finishedAt) {
    const verb = entry.status === 'dnf' ? 'Stopped' : 'Finished'
    return `${verb} ${new Date(entry.finishedAt).toLocaleDateString()}`
  }
  if (entry.startedAt) {
    return `Started ${new Date(entry.startedAt).toLocaleDateString()}`
  }
  return null
}