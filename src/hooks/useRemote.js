import { useCallback, useEffect, useSyncExternalStore } from 'react'

// Module-level stores keyed by string (e.g. 'tasks'). Every consumer of the
// same key reads the same cache and is notified on change — the same
// same-tab live-sync model as useLocalStorage, but for backend-backed data:
//   { data, loading, error, refresh, setData }
//
// Fetch is deliberately NOT fire-and-forget per render. The first consumer to
// mount triggers one `list()` fetch for the key; later consumers of the same
// key reuse the in-flight promise or the cached data. Mutations update the
// cache via setData() from the API response (no full-collection refetch).

const stores = new Map()

function readInitial(seed) {
  return typeof seed === 'function' ? seed() : seed ?? []
}

function ensureStore(key, seed) {
  let store = stores.get(key)
  if (!store) {
    store = {
      data: readInitial(seed),
      loading: false,
      error: null,
      fetched: false,
      promise: null,
      listeners: new Set(),
    }
    stores.set(key, store)
  }
  return store
}

export default function useRemote(key, fetchList, { seed = [] } = {}) {
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

  const getSnapshot = useCallback(() => store.data, [store])

  const notify = useCallback(() => {
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
        store.error = error.message
      } finally {
        store.loading = false
        store.promise = null
        notify()
      }
    })()
    store.promise = promise
    return promise
  }, [store, fetchList, notify])

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

  const data = useSyncExternalStore(subscribe, getSnapshot)

  return {
    data,
    loading: store.loading,
    error: store.error,
    setData,
    refresh,
  }
}
