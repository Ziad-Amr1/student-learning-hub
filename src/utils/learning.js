// Pure Learning Workspace helpers — no React/DOM dependency (ARCHITECTURE.md).
// Status/progress normalization is CENTRALIZED here (decision 4): components
// never implement the progress<->status rule themselves.

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// Deterministic status <-> progress normalization (decision 4).
// Rules:
// - `status === 'completed'` forces `progress` to 100 (status wins).
// - `progress >= 100` normalizes the entry to `completed`.
// - `progress` is always clamped to the 0-100 range.
// Returns the SAME object reference when nothing changed (render-friendly).
export function normalizeLearningEntry(entry) {
  const { status } = entry
  const clampedProgress = clamp(Number(entry.progress) || 0, 0, 100)

  let nextStatus = status
  let nextProgress = clampedProgress

  if (nextStatus === 'completed') {
    nextProgress = 100
  } else if (nextProgress >= 100) {
    nextStatus = 'completed'
  }

  if (nextStatus !== status || nextProgress !== entry.progress) {
    return { ...entry, status: nextStatus, progress: nextProgress }
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