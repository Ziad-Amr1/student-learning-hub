import { useEffect, useState } from 'react'
import useRemote from './useRemote.js'
import { taskApi } from '../api/taskApi.js'
import { TASKS } from '../data/tasks.js'
import { normalizeTaskStatus } from '../utils/taskStatus.js'

const STORE_KEY = 'tasks'
// Legacy localStorage app-data source, migrated into the backend exactly once.
// See docs/DATA_MODEL.md → Persistence → Remote state.
const LS_TASKS_KEY = 'student-hub:tasks'
// Migration/seed completion marker — written only on FULL success. Its value
// must stay 'student-hub:tasks-seeded' for compatibility with already-migrated
// browsers.
const LS_MIGRATED_KEY = 'student-hub:tasks-seeded'

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

// Prepare a legacy record for migration: canonical values so the backend's
// strict domain validation passes (legacy 'todo' → 'unstarted', per DATA_MODEL).
function normalizeForMigration(task) {
  return {
    ...task,
    status: normalizeTaskStatus(task.status),
  }
}

let migrationPromise = null

export function useTasks() {
  const { data, loading, error, setData, refresh } = useRemote(STORE_KEY, taskApi.list, { seed: [] })
  const [migrationFailures, setMigrationFailures] = useState(null)

  // One-time seed/migration. It is IDEMPOTENT: the backend create-by-id
  // returns an existing record instead of inserting a duplicate, so re-running
  // a partially failed migration fills only the missing records. Unless EVERY
  // record lands, the legacy source is PRESERVED and the completion marker is
  // NOT written, so the migration can be retried safely on a later load.
  useEffect(() => {
    if (loading || error) return
    if (migrationPromise) return

    // Completion marker present → backend is authoritative; nothing to import.
    if (localStorage.getItem(LS_MIGRATED_KEY)) return

    const localSource = readLocalTasks()

    // Backend already has Tasks AND there is no remaining localStorage source
    // to import → treat as already done and mark it, so we stop polling.
    if (data && data.length > 0 && !localSource) {
      localStorage.setItem(LS_MIGRATED_KEY, '1')
      return
    }

    setMigrationFailures(null)

    migrationPromise = (async () => {
      const source = (localSource ?? TASKS).map(normalizeForMigration)
      const failures = []
      for (const task of source) {
        try {
          await taskApi.create(task)
        } catch (err) {
          failures.push({
            id: task.id,
            title: task.title,
            error: err.message || 'unknown error',
          })
        }
      }

      if (failures.length === 0) {
        // Full success → backend becomes the single source of truth. Clear the
        // migrated source only when it was real local data (not the seed) and
        // mark the migration complete.
        if (localSource) localStorage.removeItem(LS_TASKS_KEY)
        localStorage.setItem(LS_MIGRATED_KEY, '1')
      } else {
        // Incomplete → preserve the legacy source for retry and do NOT mark
        // complete. The failures are surfaced (not swallowed silently).
        setMigrationFailures(failures)
        console.error('[huby] task migration incomplete — local data preserved for retry', failures)
      }

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

  return {
    tasks: data,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh,
    migrationFailures,
  }
}
