import { useEffect } from 'react'
import useRemote from './useRemote.js'
import { taskApi } from '../api/taskApi.js'
import { TASKS } from '../data/tasks.js'
import { normalizeTaskStatus } from '../utils/taskStatus.js'

const STORE_KEY = 'tasks'
const LS_TASKS_KEY = 'student-hub:tasks'
const LS_SEEDED_KEY = 'student-hub:tasks-seeded'

function readLocalTasks() {
  try {
    const raw = localStorage.getItem(LS_TASKS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

// Normalize a stored task for migration: canonical ids/status so strict
// backend validation passes (legacy 'todo' → 'unstarted', per DATA_MODEL).
function normalizeForMigration(task) {
  return {
    ...task,
    status: normalizeTaskStatus(task.status),
  }
}

let migrationPromise = null

export function useTasks() {
  const { data, loading, error, setData, refresh } = useRemote(STORE_KEY, taskApi.list, { seed: [] })

  // One-time seed/migration. Runs only when the backend is empty (first run
  // for this data). Prefers existing localStorage tasks (preserving ids);
  // otherwise falls back to the seed for a first-time visitor. Clears the
  // localStorage app-data key so the backend becomes the single source of
  // truth. Guarded at module level so concurrent consumers don't double-run.
  useEffect(() => {
    if (loading || error) return
    if (data && data.length > 0) {
      localStorage.removeItem(LS_SEEDED_KEY)
      return
    }
    if (migrationPromise) return
    if (localStorage.getItem(LS_SEEDED_KEY)) return

    migrationPromise = (async () => {
      const local = readLocalTasks()
      const source = local ?? TASKS
      for (const task of source) {
        try {
          await taskApi.create(normalizeForMigration(task))
        } catch {
          // keep going — a failed insert shouldn't block the rest of the seed
        }
      }
      localStorage.removeItem(LS_TASKS_KEY)
      localStorage.setItem(LS_SEEDED_KEY, '1')
      await refresh()
    })().finally(() => {
      migrationPromise = null
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error])

  const createTask = async (payload) => {
    const created = await taskApi.create(payload)
    setData((current) => [created, ...(current ?? [])])
    return created
  }

  const updateTask = async (id, patch) => {
    const updated = await taskApi.update(id, patch)
    setData((current) => (current ?? []).map((t) => (t.id === id ? updated : t)))
    return updated
  }

  const deleteTask = async (id) => {
    await taskApi.remove(id)
    setData((current) => (current ?? []).filter((t) => t.id !== id))
  }

  return { tasks: data, loading, error, createTask, updateTask, deleteTask, refresh }
}
