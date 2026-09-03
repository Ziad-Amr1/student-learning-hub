import { useEffect, useRef } from 'react'
import useRemote from './useRemote.js'
import { profileApi } from '../api/profileApi.js'
import { profileSeed } from '../data/profile.js'

// Singleton persistence seam for the Profile page. Unlike the array domains
// (which use useRemoteSeed), the profile is a SINGLE record, so migration is a
// one-time upsert rather than a record-by-record import:
//  - On first load with no completion marker, the legacy `student-hub:profile`
//    object is migrated (or the seed is used when none exists), persisted via PUT,
//    local cleared only on success, and a completion marker written.
//  - Backend is the source of truth thereafter; save() PUTs the full profile.
// Retry-safe: PUT is idempotent (upsert), so a failed first seed simply re-runs.

const LS_KEY = 'student-hub:profile'
const MARKER_KEY = 'student-hub:profile-seeded'

function readLegacy() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function useProfile() {
  const { data, loading, error, setData, refresh } = useRemote('profile', profileApi.get, {
    seed: null,
  })
  const seeding = useRef(false)

  useEffect(() => {
    if (loading || error) return
    if (localStorage.getItem(MARKER_KEY)) return
    if (data !== null && data !== undefined) return
    if (seeding.current) return

    seeding.current = true
    const legacy = readLegacy()
    const source = legacy ?? profileSeed
    profileApi
      .update(source)
      .then((saved) => {
        setData(saved)
        if (legacy) localStorage.removeItem(LS_KEY)
        localStorage.setItem(MARKER_KEY, '1')
      })
      .catch(() => {
        // backend unreachable / rejected — stay unseeded; a later mount retries
      })
      .finally(() => {
        seeding.current = false
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, data])

  const save = async (nextProfile) => {
    const saved = await profileApi.update(nextProfile)
    setData(saved)
    return saved
  }

  return { profile: data, loading, error, save, refresh }
}
