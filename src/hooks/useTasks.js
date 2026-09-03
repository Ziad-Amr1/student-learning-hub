import useRemoteSeed from './useRemoteSeed.js'
import { taskApi } from '../api/taskApi.js'
import { TASKS } from '../data/tasks.js'
import { normalizeTaskStatus } from '../utils/taskStatus.js'

const STORE_KEY = 'tasks'
const LS_TASKS_KEY = 'student-hub:tasks'
const LS_MIGRATED_KEY = 'student-hub:tasks-seeded'

// Migration normalization: map the legacy persisted 'todo' status to the
// canonical 'unstarted' so the backend's strict domain validation passes.
const normalizeForMigration = (task) => ({
  ...task,
  status: normalizeTaskStatus(task.status),
})

export function useTasks() {
  const remote = useRemoteSeed({
    key: STORE_KEY,
    list: taskApi.list,
    create: taskApi.create,
    update: taskApi.update,
    remove: taskApi.remove,
    storageKey: LS_TASKS_KEY,
    markerKey: LS_MIGRATED_KEY,
    seed: [...TASKS],
    normalize: normalizeForMigration,
  })

  return {
    tasks: remote.data,
    loading: remote.loading,
    error: remote.error,
    createTask: remote.createOne,
    updateTask: remote.updateOne,
    deleteTask: remote.deleteOne,
    refresh: remote.refresh,
    migrationFailures: remote.migrationFailures,
  }
}
