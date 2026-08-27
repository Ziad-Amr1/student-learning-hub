// Pure Learning Workspace helpers — no React/DOM dependency (ARCHITECTURE.md).
// Status/progress normalization is CENTRALIZED here (decision 4): components
// never implement the progress<->status rule themselves. Pinned defaults,
// transient sorting, and context-aware unit formatting also live here
// (Sprint 07.6 refinement).

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// Deterministic status <-> progress normalization (decision 4) + pinned
// default. Rules:
// - `status === 'completed'` forces `progress` to 100 (status wins).
// - `progress >= 100` normalizes the entry to `completed`.
// - `progress` is always clamped to the 0-100 range.
// - `pinned` is a boolean (defaults false; legacy entries without the field
//   read as false — a normalized copy renders until the entry is next saved).
// Returns the SAME object reference when nothing changed (render-friendly).
export function normalizeLearningEntry(entry) {
  const { status } = entry
  const pinned = !!entry.pinned
  const clampedProgress = clamp(Number(entry.progress) || 0, 0, 100)

  let nextStatus = status
  let nextProgress = clampedProgress

  if (nextStatus === 'completed') {
    nextProgress = 100
  } else if (nextProgress >= 100) {
    nextStatus = 'completed'
  }

  if (
    nextStatus !== status ||
    nextProgress !== entry.progress ||
    pinned !== entry.pinned
  ) {
    return { ...entry, status: nextStatus, progress: nextProgress, pinned }
  }
  return entry
}

// "Currently Learning" = explicitly in-progress or paused (decision 5 —
// status-driven, never derived from progress).
export function isCurrentlyLearning(entry) {
  return entry.status === 'in-progress' || entry.status === 'paused'
}

export function deriveCurrentlyLearning(entries) {
  return entries.filter(isCurrentlyLearning)
}

// Newest-first by updatedAt (widget preview lists).
export function sortLearningByUpdatedAt(entries) {
  return [...entries].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

// Resolve stored IDs against a collection. Missing/deleted targets are
// silently omitted (decision 7) — dangling references never crash and never
// cascade into the source entity.
export function resolveLinkedIds(ids, items) {
  if (!Array.isArray(ids)) return []
  return ids.map((id) => items.find((item) => item.id === id)).filter(Boolean)
}

// --- Transient sorting (mirrors utils/taskSort.js) ---
// Pinned entries always rank first (Notes/Resources pattern); the selected
// mode orders the rest. Operates on copies only — never mutates the persisted
// array order. Sorts are NOT persisted (transient toolbar state; the shared
// useLocalStorage value stays in storage order).

export const LEARNING_SORT_OPTIONS = [
  { value: 'manual', label: 'Manual order' },
  { value: 'newest', label: 'Newest first' },
  { value: 'recent', label: 'Recently updated' },
  { value: 'progress', label: 'Progress' },
  { value: 'title', label: 'Title A–Z' },
]

const compareNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
const compareRecent = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
const compareProgress = (a, b) => (b.progress ?? 0) - (a.progress ?? 0)
const compareTitle = (a, b) => a.title.localeCompare(b.title)
// Note: status/category sorting is intentionally NOT offered — the two
// sections already partition by status, and category carries no ordering
// semantics (recorded in SPRINT_07_6 refinement decisions).
const comparePinned = (a, b) => Number(!!b.pinned) - Number(!!a.pinned)

const compareByMode = (a, b, mode) => {
  switch (mode) {
    case 'newest':
      return compareNewest(a, b) || compareRecent(a, b)
    case 'recent':
      return compareRecent(a, b) || compareNewest(a, b)
    case 'progress':
      return compareProgress(a, b) || compareRecent(a, b)
    case 'title':
      return compareTitle(a, b) || compareRecent(a, b)
    default:
      return compareRecent(a, b)
  }
}

export function sortLearningEntries(entries, mode) {
  const list = [...entries]
  if (mode === 'manual' || mode === undefined) {
    return list.sort(comparePinned)
  }
  return list.sort((a, b) => comparePinned(a, b) || compareByMode(a, b, mode))
}

// --- Context-aware progress metadata (Sprint 07.6 refinement) ---
// The learning UI never blindly prints "hours": course/practice/topic track
// study hours, book tracks pages (`totalPages`), video carries an
// (informational) duration in minutes (`videoMinutes`). Per the refinement
// decision, the ONLY added schema fields are `pinned`, `totalPages`, and
// `videoMinutes` — so a book's completed-page count is derived from `progress`
// × `totalPages` rather than being stored. All target fields are optional;
// absent targets fall back to a bare % in the card.
export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

export function formatLearningUnits(entry) {
  if (entry.category === 'book' && typeof entry.totalPages === 'number') {
    const completed = Math.round(((entry.progress ?? 0) / 100) * entry.totalPages)
    return `${completed} of ${entry.totalPages} pages`
  }
  if (entry.category === 'video' && typeof entry.videoMinutes === 'number') {
    return formatDuration(entry.videoMinutes)
  }
  if (typeof entry.targetHours === 'number') {
    const done = entry.completedHours ?? 0
    return `${done} of ${entry.targetHours} hrs`
  }
  return null
}