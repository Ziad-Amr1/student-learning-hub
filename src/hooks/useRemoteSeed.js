import { useEffect, useRef, useState } from 'react'
import useRemote from './useRemote.js'

// Shared seed + one-time-migration wrapper around `useRemote` for ARRAY
// domains (Tasks, Notes, Resources, Learning). Created only after multiple
// domains proved the identical pattern; see docs/ARCHITECTURE.md → Remote data.
//
// Guarantees (mirror the Tasks D-1 pattern):
//  - Backend is the application-data source of truth.
//  - On first load (backend empty AND no completion marker), the legacy
//    localStorage source is imported into the backend one record at a time.
//  - Normalization happens client-side (per `normalize`) so strict backend
//    domain validation passes.
//  - The legacy key is cleared + a completion marker written ONLY on FULL
//    success. Partial failure preserves the source, surfaces migrationFailures
//    and is retry-safe: backend create() is idempotent by id, so a retry fills
//    just the gaps (no duplicates, no loss).
//
// `config`:
//   key        storage key for useRemote (e.g. 'notes')
//   list       () => Promise<items[]>            list fetcher
//   create     (item) => Promise<item>           create fetcher
//   update     (id, patch) => Promise<item>      update fetcher
//   remove     (id) => Promise                   delete fetcher
//   storageKey legacy localStorage key (e.g. 'student-hub:notes')
//   markerKey  completion-marker key (e.g. 'student-hub:notes-seeded')
//   seed       array of seed items used when there is no legacy local source
//   normalize  (item) => item  per-record normalization for migration
//
// Returns { data, loading, error, refresh, setData, migrationFailures,
//           createOne, updateOne, deleteOne }.

const migrationPromises = new Map()

function readLegacy(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

export default function useRemoteSeed(config) {
  const { key, list, create, update, remove, storageKey, markerKey, seed, normalize } = config

  const { data, loading, error, setData, refresh } = useRemote(key, list, { seed: [] })
  const [migrationFailures, setMigrationFailures] = useState(null)
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    if (loading || error) return
    if (migrationPromises.has(key)) return

    if (localStorage.getItem(markerKey)) return

    const localSource = readLegacy(storageKey)

    // Backend already has records and there is no remaining local source to
    // import → treat as already done and mark it, so we stop polling.
    if (data && data.length > 0 && !localSource) {
      localStorage.setItem(markerKey, '1')
      return
    }

    setMigrationFailures(null)

    const promise = (async () => {
      const source = (localSource ?? seed).map(normalize)
      const failures = []
      for (const item of source) {
        try {
          await create(item)
        } catch (err) {
          failures.push({
            id: item.id,
            title: item.title ?? item.id,
            error: err.message || 'unknown error',
          })
        }
      }

      if (failures.length === 0) {
        if (localSource) localStorage.removeItem(storageKey)
        localStorage.setItem(markerKey, '1')
      } else {
        setMigrationFailures(failures)
        console.error(`[huby] ${key} migration incomplete — local data preserved for retry`, failures)
      }

      await refresh()
    })().finally(() => {
      migrationPromises.delete(key)
    })

    migrationPromises.set(key, promise)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error])

  const createOne = async (payload) => {
    const created = await create(payload)
    setData((current) => [created, ...(current ?? [])])
    return created
  }

  const updateOne = async (id, patch) => {
    const updated = await update(id, patch)
    setData((current) => (current ?? []).map((item) => (item.id === id ? updated : item)))
    return updated
  }

  const deleteOne = async (id) => {
    await remove(id)
    setData((current) => (current ?? []).filter((item) => item.id !== id))
  }

  return { data, loading, error, refresh, setData, migrationFailures, createOne, updateOne, deleteOne }
}
