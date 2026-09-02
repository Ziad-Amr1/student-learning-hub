import useRemoteSeed from './useRemoteSeed.js'
import { noteApi } from '../api/noteApi.js'
import { NOTES } from '../data/notes.js'

const STORE_KEY = 'notes'
const LS_KEY = 'student-hub:notes'
const LS_MIGRATED_KEY = 'student-hub:notes-seeded'

// Migration normalization: coerce legacy-optional fields to canonical values
// so the backend's strict domain validation passes.
const normalizeForMigration = (note) => ({
  ...note,
  pinned: Boolean(note.pinned),
  category: note.category || undefined,
})

export function useNotes() {
  const remote = useRemoteSeed({
    key: STORE_KEY,
    list: noteApi.list,
    create: noteApi.create,
    update: noteApi.update,
    remove: noteApi.remove,
    storageKey: LS_KEY,
    markerKey: LS_MIGRATED_KEY,
    seed: [...NOTES],
    normalize: normalizeForMigration,
  })

  return {
    notes: remote.data,
    loading: remote.loading,
    error: remote.error,
    createNote: remote.createOne,
    updateNote: remote.updateOne,
    deleteNote: remote.deleteOne,
    refresh: remote.refresh,
    migrationFailures: remote.migrationFailures,
  }
}
