import useRemoteSeed from './useRemoteSeed.js'
import { libraryApi } from '../api/libraryApi.js'
import { LIBRARY_ENTRIES } from '../data/library.js'

const STORE_KEY = 'library'
const LS_KEY = 'student-hub:library'
const LS_MIGRATED_KEY = 'student-hub:library-seeded'

// Migration normalization: coerce legacy-optional fields to canonical values
// so the backend's strict domain validation passes. The status/progress
// invariant itself is owned by the backend Library model (mirrors
// utils/library.js normalizeLibraryEntry). With an empty seed this shims any
// pre-migration local shelf defensively — the domain has no built-in demo data.
const normalizeForMigration = (entry) => ({
  ...entry,
  title: entry.title,
  author: entry.author ?? undefined,
  status: entry.status || 'want-to-read',
  progress: entry.progress ?? 0,
  rating: entry.rating ?? undefined,
  notes: entry.notes ?? undefined,
  quotes: Array.isArray(entry.quotes) ? entry.quotes : [],
  relatedResourceIds: Array.isArray(entry.relatedResourceIds) ? entry.relatedResourceIds : [],
  relatedLearningIds: Array.isArray(entry.relatedLearningIds) ? entry.relatedLearningIds : [],
})

export function useLibrary() {
  const remote = useRemoteSeed({
    key: STORE_KEY,
    list: libraryApi.list,
    create: libraryApi.create,
    update: libraryApi.update,
    remove: libraryApi.remove,
    storageKey: LS_KEY,
    markerKey: LS_MIGRATED_KEY,
    seed: [...LIBRARY_ENTRIES],
    normalize: normalizeForMigration,
  })

  return {
    library: remote.data,
    loading: remote.loading,
    error: remote.error,
    createLibrary: remote.createOne,
    updateLibrary: remote.updateOne,
    deleteLibrary: remote.deleteOne,
    refresh: remote.refresh,
    migrationFailures: remote.migrationFailures,
  }
}