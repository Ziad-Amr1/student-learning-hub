import useRemoteSeed from './useRemoteSeed.js'
import { learningApi } from '../api/learningApi.js'
import { LEARNING_ENTRIES } from '../data/learning.js'

const STORE_KEY = 'learning'
const LS_KEY = 'student-hub:learning'
const LS_MIGRATED_KEY = 'student-hub:learning-seeded'

// Migration normalization: coerce legacy-optional fields to canonical values
// so the backend's strict domain validation passes. The status/progress
// invariant itself is owned by the backend Learning model (mirrors
// utils/learning.js normalizeLearningEntry).
const normalizeForMigration = (entry) => ({
  ...entry,
  title: entry.title,
  category: entry.category || 'topic',
  status: entry.status || 'not-started',
  progress: entry.progress ?? 0,
  pinned: Boolean(entry.pinned),
  targetHours: entry.targetHours ?? undefined,
  completedHours: entry.completedHours ?? undefined,
  totalPages: entry.totalPages ?? undefined,
  videoMinutes: entry.videoMinutes ?? undefined,
  relatedNotes: Array.isArray(entry.relatedNotes) ? entry.relatedNotes : [],
  relatedResources: Array.isArray(entry.relatedResources) ? entry.relatedResources : [],
})

export function useLearning() {
  const remote = useRemoteSeed({
    key: STORE_KEY,
    list: learningApi.list,
    create: learningApi.create,
    update: learningApi.update,
    remove: learningApi.remove,
    storageKey: LS_KEY,
    markerKey: LS_MIGRATED_KEY,
    seed: [...LEARNING_ENTRIES],
    normalize: normalizeForMigration,
  })

  return {
    learning: remote.data,
    loading: remote.loading,
    error: remote.error,
    createLearning: remote.createOne,
    updateLearning: remote.updateOne,
    deleteLearning: remote.deleteOne,
    refresh: remote.refresh,
    migrationFailures: remote.migrationFailures,
  }
}
