import useRemoteSeed from './useRemoteSeed.js'
import { resourceApi } from '../api/resourceApi.js'
import { RESOURCES } from '../data/resources.js'

const STORE_KEY = 'resources'
const LS_KEY = 'student-hub:resources'
const LS_MIGRATED_KEY = 'student-hub:resources-seeded'

// Migration normalization: keep only the canonical fields the backend model
// understands, coerce pinned to boolean, and drop empty/undefined description.
const normalizeForMigration = (resource) => ({
  id: resource.id,
  title: resource.title,
  url: resource.url,
  category: resource.category,
  description: resource.description || undefined,
  pinned: Boolean(resource.pinned),
  createdAt: resource.createdAt,
})

export function useResources() {
  const remote = useRemoteSeed({
    key: STORE_KEY,
    list: resourceApi.list,
    create: resourceApi.create,
    update: resourceApi.update,
    remove: resourceApi.remove,
    storageKey: LS_KEY,
    markerKey: LS_MIGRATED_KEY,
    seed: [...RESOURCES],
    normalize: normalizeForMigration,
  })

  return {
    resources: remote.data,
    loading: remote.loading,
    error: remote.error,
    createResource: remote.createOne,
    updateResource: remote.updateOne,
    deleteResource: remote.deleteOne,
    refresh: remote.refresh,
    migrationFailures: remote.migrationFailures,
  }
}
