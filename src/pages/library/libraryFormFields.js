// The ONE Add/Edit form contract for My Library (phase-0 requirements 2 + 3).
//
// This module exists so that validation rules, the focus order, and the DOM ids
// used to move focus to a failing control are defined exactly once and shared
// by the Add and Edit dialogs. Both dialogs are the SAME form
// (LibraryEntryForm), so there is no possibility of a second implementation
// drifting away from this one.
//
// Pure module: no React, no DOM access (it only *names* the ids; focusing
// happens in the page).

import { LIBRARY_STATUSES } from '../../constants/libraryStatus.js'
import {
  pagesFromProgress,
  progressFromPages,
  validatePageInput,
} from '../../utils/library.js'

const MAX_TITLE = 120
const MAX_AUTHOR = 120
const MAX_RATING = 5

// DOM id of every focusable field, mirroring the ids the form renders. Used to
// focus the first invalid control after a failed submit.
export const LIBRARY_FIELD_IDS = {
  title: 'library-title',
  author: 'library-author',
  status: 'library-status',
  progress: 'library-progress',
  currentPages: 'library-current-pages',
  totalPages: 'library-total-pages',
  rating: 'library-rating',
  resourceUrl: 'library-resource-url',
}

// Validation order IS the focus order, and matches the visual order of the
// form (identity -> reading progress -> personal data -> linking).
export const LIBRARY_FIELD_ORDER = [
  'title',
  'author',
  'status',
  'progress',
  'currentPages',
  'totalPages',
  'rating',
  'resourceUrl',
]

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const isPositiveInteger = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && Number.isInteger(parsed) && parsed > 0
}

// Validate the whole form at once — every rule is evaluated, not just the first
// failure, so a single submit shows every problem at once.
//
// Returns:
//   errors    field-keyed messages for the UI ({} when valid)
//   progress  the percentage that will actually be submitted
//   totalPages the page count that will actually be submitted (null = unset)
//
// Client-side rules are deliberately the FIELD authority: the backend 400
// carries no per-field attribution, and a network failure must never be
// presented as a field error.
export function validateLibraryForm(form) {
  const errors = {}

  const title = form.title.trim()
  if (title === '') errors.title = 'Title is required'
  else if (title.length > MAX_TITLE) {
    errors.title = `Title must be ${MAX_TITLE} characters or fewer`
  }

  if (form.author.trim().length > MAX_AUTHOR) {
    errors.author = `Author must be ${MAX_AUTHOR} characters or fewer`
  }

  if (!LIBRARY_STATUSES.includes(form.status)) errors.status = 'Choose a status'

  const totalRaw = form.totalPages.trim()
  const totalPages = isPositiveInteger(totalRaw) ? Number(totalRaw) : null
  let progress = 0

  if (totalRaw !== '') {
    // Having a total page count means PAGES mode: `currentPages` is the input
    // and the percentage is derived, so the two can never disagree.
    Object.assign(errors, validatePageInput(form.currentPages, totalRaw))
    if (!errors.currentPages && !errors.totalPages) {
      const derived = progressFromPages(form.currentPages, totalRaw)
      if (derived === null) errors.currentPages = 'Enter the current page and total pages'
      else progress = derived
    }
  } else if (form.progress.trim() === '') {
    errors.progress = 'Progress is required'
  } else if (!Number.isFinite(Number(form.progress))) {
    errors.progress = 'Progress must be a number between 0 and 100'
  } else if (Number(form.progress) < 0 || Number(form.progress) > 100) {
    errors.progress = 'Progress must be between 0 and 100'
  } else {
    progress = Number(form.progress)
  }

  if (form.rating.trim() !== '') {
    const rating = Number(form.rating)
    if (!Number.isFinite(rating)) errors.rating = `Rating must be a number between 0 and ${MAX_RATING}`
    else if (rating < 0) errors.rating = 'Rating cannot be negative'
    else if (rating > MAX_RATING) errors.rating = `Rating must be at most ${MAX_RATING}`
  }

  if (form.alsoResource) {
    const url = form.resourceUrl.trim()
    if (url === '') errors.resourceUrl = 'Enter the resource URL, or untick "add a new Resource entry"'
    else if (!isHttpUrl(url)) errors.resourceUrl = 'Enter a valid http(s) URL'
  }

  // The finished invariant is model-owned; mirror it here so the form never
  // shows a percentage the backend would overwrite.
  if (form.status === 'finished') progress = 100

  return {
    errors,
    progress: Math.min(Math.max(Number.isFinite(progress) ? progress : 0, 0), 100),
    totalPages,
  }
}

// Seed a form from a stored book for the Edit dialog. Pages mode is DERIVED
// from the stored page count (never a separate stored field), and the current
// page is re-derived from the stored percentage.
export function libraryFormFromEntry(book) {
  const totalPages = book.totalPages ?? null
  return {
    title: book.title,
    author: book.author ?? '',
    status: book.status,
    progress: String(book.progress ?? 0),
    currentPages: totalPages === null ? '' : String(pagesFromProgress(book) ?? 0),
    totalPages: totalPages === null ? '' : String(totalPages),
    rating: book.rating == null ? '' : String(book.rating),
    notes: book.notes ?? '',
    quotes: Array.isArray(book.quotes) ? book.quotes.join('\n') : '',
    relatedResourceIds: book.relatedResourceIds || [],
    relatedLearningIds: book.relatedLearningIds || [],
    alsoResource: false,
    resourceUrl: '',
    alsoLearning: false,
  }
}
