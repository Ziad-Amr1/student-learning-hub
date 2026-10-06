// Pure filtering + tag-normalization logic for the Notes page (Sprint 11
// phase 4). Extracted from Notes.jsx so the toolbar contract and the tag
// editor's commit rule are testable without React or a DOM, and so the
// additive AND semantics live in exactly one place.
//
// Filter options are DERIVED from the loaded note data — same rule as the
// Tasks/Resources pattern: "all" first, then values in order of first
// appearance, and nothing that is not actually present.
//
// Case: note `category` is a free-text label the Model only trims, so category
// options are case-as-is. note `tags` are NORMALIZED to lowercase by the Model
// (trim → lowercase → drop empty → dedupe, first-seen order), so tag options
// are always already-canonical — see normalizeTags below.

export const NOTE_CATEGORY_ALL = 'all'
export const NOTE_TAG_ALL = 'all'

/**
 * Trims, lowercases, drops empty values, and dedupes while preserving
 * first-seen order — the exact normalization the backend Model applies to every
 * tag write. The editor runs the same rule on commit so what the user commits
 * is byte-for-byte what gets stored (and the filter sees the same tokens).
 */
export function normalizeTags(value) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  const result = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const tag = item.trim().toLowerCase()
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    result.push(tag)
  }
  return result
}

const presentStrings = (values) =>
  [...new Set(values.filter((value) => typeof value === 'string' && value.length > 0))]

/**
 * Category filter options: 'all' followed by every distinct category present
 * in `notes`, in order of first appearance. Notes without a category
 * contribute nothing, so an empty list yields just ['all'].
 */
export function noteCategoryOptions(notes = []) {
  return [NOTE_CATEGORY_ALL, ...presentStrings(notes.map((note) => note.category))]
}

/**
 * Tag filter options: 'all' followed by every distinct tag across the notes,
 * in order of first appearance (each note's tags are already first-seen-ordered
 * and deduped by the Model). Notes without tags contribute nothing.
 */
export function noteTagOptions(notes = []) {
  const tags = []
  const seen = new Set()
  for (const note of notes) {
    if (!Array.isArray(note.tags)) continue
    for (const tag of note.tags) {
      if (seen.has(tag)) continue
      seen.add(tag)
      tags.push(tag)
    }
  }
  return [NOTE_TAG_ALL, ...tags]
}

/**
 * Additive AND filter: a note is kept only when it satisfies EVERY active
 * criterion, where 'all' (or an empty query) matches everything. Search spans
 * title ∪ content (the established Notes search surface); category and tag match
 * exactly. Sort order is never considered — sorting is applied afterwards.
 */
export function filterNotes(
  notes = [],
  { query = '', category = NOTE_CATEGORY_ALL, tag = NOTE_TAG_ALL } = {},
) {
  const needle = query.trim().toLowerCase()

  return notes.filter((note) => {
    const matchesSearch =
      !needle ||
      note.title.toLowerCase().includes(needle) ||
      note.content.toLowerCase().includes(needle)
    const matchesCategory = category === NOTE_CATEGORY_ALL || note.category === category
    const matchesTag = tag === NOTE_TAG_ALL || (Array.isArray(note.tags) && note.tags.includes(tag))
    return matchesSearch && matchesCategory && matchesTag
  })
}