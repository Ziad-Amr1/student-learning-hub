import { useCallback, useSyncExternalStore } from 'react'

const stores = new Map()

function readStoredValue(key, initialValue) {
  try {
    const stored = window.localStorage.getItem(key)
    if (stored !== null) {
      return JSON.parse(stored)
    }
  } catch {}
  return typeof initialValue === 'function' ? initialValue() : initialValue
}

function ensureStore(key, initialValue) {
  let store = stores.get(key)
  if (!store) {
    store = {
      value: readStoredValue(key, initialValue),
      listeners: new Set(),
    }
    stores.set(key, store)
  }
  return store
}

export default function useLocalStorage(key, initialValue) {
  const store = ensureStore(key, initialValue)

  const getSnapshot = useCallback(() => store.value, [store])

  const subscribe = useCallback(
    (listener) => {
      store.listeners.add(listener)
      return () => {
        store.listeners.delete(listener)
      }
    },
    [store],
  )

  const value = useSyncExternalStore(subscribe, getSnapshot)

  const setValue = useCallback(
    (updater) => {
      const next =
        typeof updater === 'function' ? updater(store.value) : updater
      store.value = next
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {}
      for (const listener of store.listeners) {
        listener()
      }
    },
    [key, store],
  )

  return [value, setValue]
}