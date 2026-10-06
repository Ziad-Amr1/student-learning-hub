import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  filterNotes,
  noteCategoryOptions,
  noteTagOptions,
  normalizeTags,
  NOTE_CATEGORY_ALL,
  NOTE_TAG_ALL,
} from '../utils/noteFilter.js'

// Pure-logic tests for the Notes toolbar contract + the tag normalization rule
// (Sprint 11 phase 4). No React and no DOM, so it runs in the same `node:test`
// gate as the backend.

const note = (overrides = {}) => ({
  id: 'note-1',
  title: 'A note',
  content: 'body',
  category: undefined,
  tags: [],
  pinned: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
})

const ALL_FILTERS = { query: '', category: NOTE_CATEGORY_ALL, tag: NOTE_TAG_ALL }

// --- normalization ------------------------------------------------------------

test('normalizeTags applies trim → lowercase → drop-empty → dedupe, first-seen order', () => {
  assert.deepEqual(
    normalizeTags([' React ', 'react', '', ' JavaScript ', 'REACT']),
    ['react', 'javascript'],
    'whitespace is trimmed, case is folded, empties drop, duplicates collapse keeping the first seen',
  )
})

test('normalizeTags on empty/whitespace/invalid input yields an empty array', () => {
  assert.deepEqual(normalizeTags([]), [])
  assert.deepEqual(normalizeTags(['', '   ']), [])
  assert.deepEqual(normalizeTags(null), [])
  assert.deepEqual(normalizeTags(undefined), [])
  assert.deepEqual(normalizeTags('react'), [], 'a bare string is not an array of tags')
  assert.deepEqual(normalizeTags([42]), [], 'non-strings are dropped')
})

test('normalizeTags keeps already-canonical tags stable', () => {
  assert.deepEqual(normalizeTags(['react', 'css', 'git']), ['react', 'css', 'git'])
})

// --- options -----------------------------------------------------------------

test('noteCategoryOptions derives distinct values from the data, all first', () => {
  const notes = [
    note({ category: 'React' }),
    note({ category: 'CSS' }),
    note({ category: 'React' }),
  ]
  assert.deepEqual(noteCategoryOptions(notes), [NOTE_CATEGORY_ALL, 'React', 'CSS'])
})

test('noteCategoryOptions skips uncategorized notes and yields only "all" when empty', () => {
  assert.deepEqual(noteCategoryOptions([note(), note({ category: undefined })]), [NOTE_CATEGORY_ALL])
  assert.deepEqual(noteCategoryOptions([]), [NOTE_CATEGORY_ALL])
  assert.deepEqual(noteCategoryOptions(), [NOTE_CATEGORY_ALL], 'no argument must be safe')
})

test('noteTagOptions derives distinct tags in order of first appearance, all first', () => {
  const notes = [
    note({ id: 'a', tags: ['react', 'css'] }),
    note({ id: 'b', tags: ['css', 'git'] }),
    note({ id: 'c', tags: [] }),
  ]
  assert.deepEqual(noteTagOptions(notes), [NOTE_TAG_ALL, 'react', 'css', 'git'])
})

test('noteTagOptions yields only "all" when no note carries tags', () => {
  assert.deepEqual(noteTagOptions([note(), note({ tags: [] })]), [NOTE_TAG_ALL])
  assert.deepEqual(noteTagOptions([]), [NOTE_TAG_ALL])
})

// --- the AND pipeline --------------------------------------------------------

test('an unset filter keeps every note', () => {
  const notes = [
    note({ id: 'a', title: 'One' }),
    note({ id: 'b', title: 'Two', category: 'React', tags: ['react'] }),
  ]
  assert.equal(filterNotes(notes, ALL_FILTERS).length, 2)
  assert.equal(filterNotes(notes).length, 2, 'default options must keep everything')
  assert.equal(filterNotes(notes, { ...ALL_FILTERS, query: '   ' }).length, 2, 'blank query is absent')
})

test('search matches the title case-insensitively', () => {
  const notes = [
    note({ id: 'a', title: 'Revise Graphs' }),
    note({ id: 'b', title: 'Buy milk' }),
  ]
  assert.deepEqual(
    filterNotes(notes, { ...ALL_FILTERS, query: 'graphs' }).map((n) => n.id),
    ['a'],
  )
})

test('search also matches the content (title ∪ content), not the title alone', () => {
  const notes = [
    note({ id: 'a', title: 'Cheat sheet', content: 'grid-template-areas' }),
    note({ id: 'b', title: 'CSS grid areas', content: 'nothing about templates here' }),
  ]
  assert.deepEqual(
    filterNotes(notes, { ...ALL_FILTERS, query: 'areas' }).map((n) => n.id),
    ['a', 'b'],
  )
  assert.deepEqual(
    filterNotes(notes, { ...ALL_FILTERS, query: 'grid-template' }).map((n) => n.id),
    ['a'],
    'a term found only in the content must still match',
  )
})

test('category filter matches exactly and excludes notes without that category', () => {
  const notes = [
    note({ id: 'a', category: 'React' }),
    note({ id: 'b', category: 'CSS' }),
    note({ id: 'c' }),
  ]
  assert.deepEqual(
    filterNotes(notes, { ...ALL_FILTERS, category: 'React' }).map((n) => n.id),
    ['a'],
  )
  assert.equal(
    filterNotes(notes, { ...ALL_FILTERS, category: 'React' }).some((n) => n.id === 'c'),
    false,
    'a note without a category must not match a specific category',
  )
})

test('tag filter matches notes carrying that tag', () => {
  const notes = [
    note({ id: 'a', tags: ['react', 'css'] }),
    note({ id: 'b', tags: ['css'] }),
    note({ id: 'c', tags: [] }),
    note({ id: 'd' }),
  ]
  assert.deepEqual(
    filterNotes(notes, { ...ALL_FILTERS, tag: 'react' }).map((n) => n.id),
    ['a'],
  )
  assert.deepEqual(
    filterNotes(notes, { ...ALL_FILTERS, tag: 'css' }).map((n) => n.id),
    ['a', 'b'],
  )
  assert.deepEqual(
    filterNotes(notes, { ...ALL_FILTERS, tag: 'missing' }),
    [],
    'an unknown tag matches nothing',
  )
  for (const n of notes) {
    assert.equal(
      filterNotes([n], { ...ALL_FILTERS, tag: 'react' }).length,
      n.id === 'a' ? 1 : 0,
      `${n.id} (tags=${JSON.stringify(n.tags)}) must match react only when it carries it`,
    )
  }
})

test('notes without tags match the "all" tag and otherwise stay reachable', () => {
  const untagged = [note({ id: 'no-tags' })]
  assert.equal(filterNotes(untagged, { ...ALL_FILTERS, tag: NOTE_TAG_ALL }).length, 1)
  assert.equal(filterNotes(untagged, { ...ALL_FILTERS, tag: 'anything' }).length, 0)
  const byCategory = filterNotes([note({ id: 'x', category: 'React' })], {
    ...ALL_FILTERS,
    category: 'React',
  })
  assert.equal(byCategory.length, 1, 'category alone must not require a tag')
})

test('filters combine with AND: search ∧ category ∧ tag', () => {
  const notes = [
    note({ id: 'match', title: 'Revise hooks', category: 'React', tags: ['react'] }),
    note({ id: 'wrong-category', title: 'Revise hooks', category: 'CSS', tags: ['react'] }),
    note({ id: 'wrong-tag', title: 'Revise hooks', category: 'React', tags: ['css'] }),
    note({ id: 'wrong-title', title: 'Buy milk', category: 'React', tags: ['react'] }),
  ]

  const filters = { query: 'revise', category: 'React', tag: 'react' }
  assert.deepEqual(
    filterNotes(notes, filters).map((n) => n.id),
    ['match'],
    'only the note satisfying every criterion survives',
  )

  // Dropping any single criterion must widen the result, never narrow it.
  assert.equal(filterNotes(notes, { ...filters, query: '' }).length, 2)
  assert.equal(filterNotes(notes, { ...filters, category: NOTE_CATEGORY_ALL }).length, 2)
  assert.equal(filterNotes(notes, { ...filters, tag: NOTE_TAG_ALL }).length, 2)
})

test('query + category + tag can all be active at once and stay additive', () => {
  const notes = [
    note({ id: 'a', title: 'React hooks', content: 'three rules', category: 'React', tags: ['react', 'career'] }),
    note({ id: 'b', title: 'React hooks', content: 'three rules', category: 'React', tags: ['react'] }),
    note({ id: 'c', title: 'React hooks', content: 'three rules', category: 'React', tags: [] }),
  ]
  assert.deepEqual(
    filterNotes(notes, { query: 'rules', category: 'React', tag: 'career' }).map((n) => n.id),
    ['a'],
  )
})

test('a filter combination that matches nothing returns an empty list', () => {
  const notes = [note({ category: 'React', tags: ['react'] })]
  assert.deepEqual(filterNotes(notes, { ...ALL_FILTERS, category: 'CSS' }), [])
  assert.deepEqual(filterNotes(notes, { ...ALL_FILTERS, tag: 'css' }), [])
})

test('filtering does not mutate the input list', () => {
  const notes = [note({ id: 'a', title: 'One' }), note({ id: 'b', title: 'Two' })]
  const before = [...notes]
  filterNotes(notes, { ...ALL_FILTERS, query: 'one' })
  assert.deepEqual(notes, before)
})