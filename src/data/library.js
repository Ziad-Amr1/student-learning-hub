// Seed library data — first-run defaults. My Library ships with an EXPLICITLY
// EMPTY seed (user decision 2026-09-27): it is a personal shelf, so the
// frontend never fabricates demo books. useRemoteSeed still runs its one-time
// migration against an empty source (a no-op that just sets the
// `student-hub:library-seeded` marker) so the backend stays the single source
// of truth from the first load. Shape: docs/DATA_MODEL.md → LibraryEntry.

export const LIBRARY_ENTRIES = []