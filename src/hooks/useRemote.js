import { useCallback, useEffect, useSyncExternalStore } from 'react'

// Module-level stores keyed by string (e.g. 'tasks'). Every consumer of the
// same key reads the same cache and is notified on change — the same
// same-tab live-sync model, but for backend-backed data:
//   { data, loading, error, refresh, setData }
//
// Fetch is deliberately NOT fire-and-forget per render. The first consumer to
// mount triggers one `list()` fetch for the key; later consumers of the same
// key reuse the in-flight promise or the cached data. Mutations update the
// cache via setData() from the API response (no full-collection refetch).

const stores = new Map()

// Module-level offline signal. Flipped on the first time a domain fetch cannot
// reach the backend AND a `fallback` seed is available — the static GitHub
// Pages build has no backend, so the app shows sample data (read-only) instead
// of an error. Once set it stays set for the session; the UI reads it via
// useOffline() to show a notice.
const offlineListeners = new Set()
let offlineSnapshot = false

function markOffline() {
  if (offlineSnapshot) return
  offlineSnapshot = true
  for (const listener of offlineListeners) listener()
}

function subscribeOffline(listener) {
  offlineListeners.add(listener)
  return () => offlineListeners.delete(listener)
}

export function useOffline() {
  return useSyncExternalStore(subscribeOffline, () => offlineSnapshot)
}

function readInitial(seed) {
  return typeof seed === 'function' ? seed() : seed ?? []
}

function ensureStore(key, seed) {
  let store = stores.get(key)
  if (!store) {
    const data = readInitial(seed)
    store = {
      data,
      loading: false,
      error: null,
      offline: false,
      fetched: false,
      promise: null,
      listeners: new Set(),
      snapshot: { data, loading: false, error: null, offline: false },
    }
    stores.set(key, store)
  }
  return store
}

export default function useRemote(key, fetchList, { seed = [], fallback } = {}) {
  const store = ensureStore(key, seed)

  const subscribe = useCallback(
    (listener) => {
      store.listeners.add(listener)
      return () => {
        store.listeners.delete(listener)
      }
    },
    [store],
  )

  const getSnapshot = useCallback(() => store.snapshot, [store])

  const notify = useCallback(() => {
    store.snapshot = {
      data: store.data,
      loading: store.loading,
      error: store.error,
      offline: store.offline,
    }
    for (const listener of store.listeners) listener()
  }, [store])

  const doFetch = useCallback(() => {
    if (store.promise) return store.promise
    store.loading = true
    store.error = null
    notify()
    const promise = (async () => {
      try {
        const data = await fetchList()
        store.data = data
        store.fetched = true
        store.error = null
      } catch (error) {
        // Backend unreachable AND a seed fallback exists → show the sample data
        // read-only instead of an error (the static GitHub Pages build). The
        // global offline signal makes AppShell surface a notice.
        if (error?.isNetworkError && fallback !== undefined) {
          store.data = readInitial(fallback)
          store.offline = true
          store.error = null
          store.fetched = true
          markOffline()
        } else {
          store.error = error.message
        }
      } finally {
        store.loading = false
        store.promise = null
        notify()
      }
    })()
    store.promise = promise
    return promise
  }, [store, fetchList, fallback, notify])

  useEffect(() => {
    if (!store.fetched && !store.loading && !store.promise) {
      doFetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const setData = useCallback(
    (updater) => {
      store.data = typeof updater === 'function' ? updater(store.data) : updater
      store.fetched = true
      notify()
    },
    [store, notify],
  )

  const refresh = useCallback(() => {
    store.fetched = false
    return doFetch()
  }, [store, doFetch])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  return {
    data: snapshot.data,
    loading: snapshot.loading,
    error: snapshot.error,
    offline: snapshot.offline,
    setData,
    refresh,
  }
}
