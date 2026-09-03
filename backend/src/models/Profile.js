import { createStore } from '../data/store.js'
import { validateAgainst } from '../utils/validate.js'
import { ValidationError } from '../utils/ValidationError.js'

const store = createStore('profile.json')
const PROFILE_ID = 'profile'

// Shared domain validation rules — owned by the Model. Profile is a SINGLETON
// (a single stored record, not an array). `required` fields are enforced on
// every upsert, matching the entity's contract.
export const PROFILE_RULES = [
  { field: 'name', required: true, type: 'string', message: "'name' is required and must be a non-empty string." },
  { field: 'avatarUrl', type: 'string', format: 'url' },
  { field: 'university', type: 'string' },
  { field: 'major', type: 'string' },
  { field: 'bio', type: 'string' },
  { field: 'skills', arrayOf: 'string' },
]

function trim(value) {
  return typeof value === 'string' ? value.trim() : value
}

// Normalize a stored Profile into its canonical read shape. Reads never mutate
// data; optional fields fall back to sensible defaults.
function fromStored(profile) {
  return {
    name: profile.name || '',
    avatarUrl: profile.avatarUrl || undefined,
    university: profile.university || undefined,
    major: profile.major || undefined,
    bio: profile.bio || undefined,
    skills: Array.isArray(profile.skills) ? profile.skills : [],
  }
}

// Build the canonical Profile field object from raw input + an optional existing
// record. Optional absent fields fall back to the existing value or empty.
function buildProfile(input, existing = null) {
  const hasExisting = existing !== null
  return {
    name: input.name !== undefined ? trim(input.name) : hasExisting ? existing.name : '',
    avatarUrl:
      input.avatarUrl !== undefined
        ? trim(input.avatarUrl) || undefined
        : hasExisting
          ? existing.avatarUrl
          : undefined,
    university:
      input.university !== undefined
        ? trim(input.university) || undefined
        : hasExisting
          ? existing.university
          : undefined,
    major:
      input.major !== undefined
        ? trim(input.major) || undefined
        : hasExisting
          ? existing.major
          : undefined,
    bio:
      input.bio !== undefined
        ? trim(input.bio) || undefined
        : hasExisting
          ? existing.bio
          : undefined,
    skills:
      input.skills !== undefined
        ? input.skills
        : hasExisting
          ? existing.skills
          : [],
  }
}

// Read the singleton profile (null when none stored).
export function get() {
  const all = store.findAll()
  return all.length ? fromStored(all[0]) : null
}

// Full upsert of the singleton — validates the whole payload (name required),
// then persists one record under a fixed id. The frontend always sends the full
// profile on save.
export function upsert(input) {
  const errors = validateAgainst(PROFILE_RULES, input, { partial: false })
  if (errors.length > 0) throw new ValidationError(errors)

  const existing = store.findAll()[0] || null
  const built = buildProfile(input, existing)

  if (existing) {
    store.update(PROFILE_ID, built)
  } else {
    store.insert({ id: PROFILE_ID, ...built })
  }
  return fromStored({ ...built, id: PROFILE_ID })
}
