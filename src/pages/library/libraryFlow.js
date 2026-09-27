// Hybrid Library -> Resource / Learning orchestration. Shared by BOTH the
// create-time flow and the edit-time flow (phase-0 requirement 8) so there is
// exactly ONE implementation of "create a target, then patch the book's link
// arrays, then report what failed".
//
// Two entry points, one primitive:
//   createBookWithHybridLinks  - book first, then the optional targets
//   linkBookTargets            - targets against an EXISTING book (Edit)
//
// Order is deliberate: the Library entry is created FIRST (book-first), so the
// primary entity always exists even when a side-target fails. The outgoing ID
// links (relatedResourceIds / relatedLearningIds) are patched onto the book in
// a single follow-up update, so a partially linked book still stores whatever
// succeeded.
//
// Partial failures are surfaced per-step (role=alert) and NEVER rolled back:
// the user just asked to create these records, so we never delete the ones that
// succeeded, and a later failure never discards an earlier success. The calls
// accept promises to keep this module free of React/hook dependencies — the
// page injects its create/update functions.
//
// DEFERRED (2026-09-27, phase-0 decision 2): a linked Learning goal is created
// from the book's status/progress at creation time and is then an INDEPENDENT
// Learning entry. There is deliberately no live mirroring in this pass — no
// back-reference, no push-sync, no new status-sync mechanism. Learning remains
// its own source of truth.

// Library status -> Learning status, used ONLY to seed a newly created goal so
// it starts in a sensible place. Explicit and one-directional: the inverse is
// never applied, because Learning is not subordinate to Library.
const LIBRARY_TO_LEARNING_STATUS = {
  'want-to-read': 'not-started',
  reading: 'in-progress',
  finished: 'completed',
  dnf: 'paused',
}

export function learningStatusForLibraryStatus(libraryStatus) {
  return LIBRARY_TO_LEARNING_STATUS[libraryStatus] ?? 'not-started'
}

// Create the optional Resource / Learning targets and patch their IDs onto an
// EXISTING book. Used by the Edit dialog; returns the updated book plus the
// per-target failures. Never throws for a target failure, and never removes an
// existing link the caller did not ask to change.
export async function linkBookTargets({
  book,
  resourcePending = null,
  learningPending = null,
  createResource,
  createLearning,
  updateBook,
}) {
  const failures = []

  let resourceId = null
  if (resourcePending) {
    try {
      const resource = await createResource({
        title: resourcePending.title,
        url: resourcePending.url,
        category: 'book',
        pinned: false,
      })
      resourceId = resource.id
    } catch (err) {
      failures.push({
        target: 'Resource',
        message: err.message || 'The book was saved, but the resource could not be created.',
      })
    }
  }

  let learningId = null
  if (learningPending) {
    try {
      const learning = await createLearning({
        title: learningPending.title,
        category: 'book',
        status: learningPending.status,
        progress: learningPending.progress,
      })
      learningId = learning.id
    } catch (err) {
      failures.push({
        target: 'Learning',
        message: err.message || 'The book was saved, but the learning goal could not be created.',
      })
    }
  }

  const nextResourceIds = resourceId
    ? [...new Set([...(book.relatedResourceIds ?? []), resourceId])]
    : book.relatedResourceIds ?? []
  const nextLearningIds = learningId
    ? [...new Set([...(book.relatedLearningIds ?? []), learningId])]
    : book.relatedLearningIds ?? []

  if (nextResourceIds.length === 0 && nextLearningIds.length === 0) {
    return { book, failures }
  }

  try {
    const patched = await updateBook(book.id, {
      relatedResourceIds: nextResourceIds,
      relatedLearningIds: nextLearningIds,
    })
    return { book: patched, failures }
  } catch {
    failures.push({
      target: 'Links',
      message: 'The book was saved, but its related links could not be attached.',
    })
    return { book, failures }
  }
}

export async function createBookWithHybridLinks({
  bookPayload,
  resourcePending = null,
  learningPending = null,
  createBook,
  createResource,
  createLearning,
  updateBook,
}) {
  const failures = []
  const book = await createBook(bookPayload)

  const linked = await linkBookTargets({
    book,
    resourcePending,
    learningPending,
    createResource,
    createLearning,
    updateBook,
  })

  return { book: linked.book, failures: [...failures, ...linked.failures] }
}
