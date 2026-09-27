import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatPageProgress,
  pagesFromProgress,
  progressFromPages,
  validatePageInput,
} from '../utils/library.js'
import {
  LIBRARY_FIELD_IDS,
  LIBRARY_FIELD_ORDER,
  libraryFormFromEntry,
  validateLibraryForm,
} from '../pages/library/libraryFormFields.js'

// Pure-logic tests for the My Library page contract: the page-progress
// derivations and the ONE validator shared by the Add and Edit dialogs.
// No React and no DOM, so it runs in the same `node:test` gate as the backend.

const form = (overrides = {}) => ({
  title: 'Atomic Habits',
  author: 'James Clear',
  status: 'reading',
  progress: '0',
  currentPages: '',
  totalPages: '',
  rating: '',
  notes: '',
  quotes: '',
  relatedResourceIds: [],
  relatedLearningIds: [],
  alsoResource: false,
  resourceUrl: '',
  alsoLearning: false,
  ...overrides,
})

test('progressFromPages derives the percentage from a page position', () => {
  assert.equal(progressFromPages('200', '400'), 50)
  assert.equal(progressFromPages('0', '400'), 0)
  assert.equal(progressFromPages('400', '400'), 100)
  // Fractional results are not rounded here; the UI rounds for display.
  assert.ok(Math.abs(progressFromPages('1', '300') - 1 / 3) < 1e-9)
})

test('progressFromPages returns null for unusable input instead of guessing', () => {
  assert.equal(progressFromPages('10', ''), null)
  assert.equal(progressFromPages('10', '0'), null)
  assert.equal(progressFromPages('abc', '400'), null)
})

test('pagesFromProgress re-derives the page position and never exceeds the total', () => {
  assert.equal(pagesFromProgress({ progress: 50, totalPages: 400 }), 200)
  assert.equal(pagesFromProgress({ progress: 0, totalPages: 400 }), 0)
  assert.equal(pagesFromProgress({ progress: 100, totalPages: 400 }), 400)
  // A progress value that would overshoot (e.g. from imported data) is capped.
  assert.equal(pagesFromProgress({ progress: 140, totalPages: 400 }), 400)
  // No page count means there is nothing to derive.
  assert.equal(pagesFromProgress({ progress: 50, totalPages: null }), null)
  assert.equal(pagesFromProgress({ progress: 50 }), null)
})

test('formatPageProgress renders a caption only when a page count exists', () => {
  assert.equal(formatPageProgress({ progress: 50, totalPages: 400 }), '200 of 400 pages')
  assert.equal(formatPageProgress({ progress: 50, totalPages: null }), null)
})

test('validatePageInput reports field errors instead of silently clamping', () => {
  assert.deepEqual(validatePageInput('200', '400'), {})

  assert.equal(validatePageInput('500', '400').currentPages, 'Current page cannot be more than the total (400).')
  assert.equal(validatePageInput('-1', '400').currentPages, 'Current page cannot be negative.')
  assert.equal(validatePageInput('10.5', '400').currentPages, 'Current page must be a whole number.')
  assert.equal(validatePageInput('x', '400').currentPages, 'Current page must be a number.')

  assert.equal(validatePageInput('10', '0').totalPages, 'Total pages must be greater than 0.')
  assert.equal(validatePageInput('10', '10.5').totalPages, 'Total pages must be a whole number.')
  assert.equal(validatePageInput('10', 'abc').totalPages, 'Total pages must be a number.')
})

test('validatePageInput treats a cleared page count as a supported operation', () => {
  // Leaving pages mode: no page count is valid on its own.
  assert.deepEqual(validatePageInput('', ''), {})
  // But a dangling current page with no total is meaningless and is reported.
  assert.equal(
    validatePageInput('120', '').currentPages,
    'Enter a total page count first, or clear this field.'
  )
})

test('validateLibraryForm accepts a minimal valid book in percentage mode', () => {
  const result = validateLibraryForm(form())
  assert.deepEqual(result.errors, {})
  assert.equal(result.progress, 0)
  assert.equal(result.totalPages, null)
})

test('validateLibraryForm requires a title and bounds author/title length', () => {
  assert.equal(validateLibraryForm(form({ title: '   ' })).errors.title, 'Title is required')

  const longTitle = 'a'.repeat(121)
  assert.match(validateLibraryForm(form({ title: longTitle })).errors.title, /120 characters or fewer/)

  const longAuthor = 'a'.repeat(121)
  assert.match(validateLibraryForm(form({ author: longAuthor })).errors.author, /120 characters or fewer/)
})

test('validateLibraryForm reports every invalid field at once, not just the first', () => {
  const { errors } = validateLibraryForm(
    form({ title: '', author: 'a'.repeat(200), progress: 'x', rating: '9' })
  )
  assert.ok(errors.title)
  assert.ok(errors.author)
  assert.ok(errors.progress)
  assert.ok(errors.rating)
})

test('validateLibraryForm bounds percentage mode to 0-100', () => {
  assert.deepEqual(validateLibraryForm(form({ progress: '' })).errors.progress, 'Progress is required')
  assert.ok(validateLibraryForm(form({ progress: '101' })).errors.progress)
  assert.ok(validateLibraryForm(form({ progress: '-1' })).errors.progress)
  assert.equal(validateLibraryForm(form({ progress: '100' })).progress, 100)
})

test('validateLibraryForm derives progress from pages when a page count is given', () => {
  const result = validateLibraryForm(form({ currentPages: '120', totalPages: '400' }))
  assert.deepEqual(result.errors, {})
  assert.equal(result.progress, 30)
  assert.equal(result.totalPages, 400)
})

test('validateLibraryForm does not report a page error on a valid percentage-mode form', () => {
  // Regression guard: a stale page error must never block a percentage submit.
  const { errors } = validateLibraryForm(form({ currentPages: '', totalPages: '', progress: '42' }))
  assert.deepEqual(errors, {})
})

test('validateLibraryForm keeps the finished invariant at 100%', () => {
  const result = validateLibraryForm(form({ status: 'finished', progress: '30' }))
  assert.equal(result.progress, 100)
  assert.deepEqual(result.errors, {})
})

test('validateLibraryForm requires a valid http(s) URL only when a Resource is created', () => {
  assert.deepEqual(validateLibraryForm(form({ alsoResource: false, resourceUrl: '' })).errors, {})

  assert.ok(validateLibraryForm(form({ alsoResource: true, resourceUrl: '' })).errors.resourceUrl)
  assert.ok(validateLibraryForm(form({ alsoResource: true, resourceUrl: 'not a url' })).errors.resourceUrl)
  // A non-web scheme is not a place the book lives.
  assert.ok(validateLibraryForm(form({ alsoResource: true, resourceUrl: 'ftp://host/book' })).errors.resourceUrl)
  assert.deepEqual(
    validateLibraryForm(form({ alsoResource: true, resourceUrl: 'https://example.com/book' })).errors,
    {}
  )
})

test('validateLibraryForm bounds the optional rating', () => {
  assert.deepEqual(validateLibraryForm(form({ rating: '' })).errors, {})
  assert.deepEqual(validateLibraryForm(form({ rating: '0' })).errors, {})
  assert.deepEqual(validateLibraryForm(form({ rating: '5' })).errors, {})
  assert.ok(validateLibraryForm(form({ rating: '6' })).errors.rating)
  assert.ok(validateLibraryForm(form({ rating: '-1' })).errors.rating)
  assert.ok(validateLibraryForm(form({ rating: 'x' })).errors.rating)
})

test('libraryFormFromEntry seeds Edit from stored data and derives pages mode', () => {
  const seeded = libraryFormFromEntry({
    id: 'lib-1',
    title: 'Deep Work',
    author: 'Cal Newport',
    status: 'reading',
    progress: 25,
    totalPages: 300,
    rating: 4,
    notes: 'good',
    quotes: ['one', 'two'],
    relatedResourceIds: ['res-1'],
    relatedLearningIds: [],
  })

  assert.equal(seeded.title, 'Deep Work')
  assert.equal(seeded.progress, '25')
  // Pages mode is implied by the stored page count; the current page is derived.
  assert.equal(seeded.totalPages, '300')
  assert.equal(seeded.currentPages, '75')
  assert.equal(seeded.quotes, 'one\ntwo')
  assert.deepEqual(seeded.relatedResourceIds, ['res-1'])
  // Creation toggles always start off in Edit.
  assert.equal(seeded.alsoResource, false)
  assert.equal(seeded.alsoLearning, false)
})

test('libraryFormFromEntry handles a book without optional fields', () => {
  const seeded = libraryFormFromEntry({
    id: 'lib-2',
    title: 'Untitled',
    status: 'want-to-read',
    progress: 0,
    author: null,
    rating: null,
    notes: null,
    quotes: [],
    totalPages: null,
  })

  assert.equal(seeded.author, '')
  assert.equal(seeded.rating, '')
  assert.equal(seeded.notes, '')
  assert.equal(seeded.quotes, '')
  assert.equal(seeded.totalPages, '')
  assert.equal(seeded.currentPages, '')
})

test('the focus contract names a real element for every validated field', () => {
  // Every field the validator can fail must have an id, or first-invalid focus
  // would silently do nothing.
  for (const field of LIBRARY_FIELD_ORDER) {
    assert.equal(typeof LIBRARY_FIELD_IDS[field], 'string', `${field} needs an id`)
  }
  assert.equal(LIBRARY_FIELD_ORDER[0], 'title')
})
