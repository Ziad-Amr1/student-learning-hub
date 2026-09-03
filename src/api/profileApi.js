// Profile domain API. Profile is a SINGLETON (a single stored record, not an
// array), so unlike the other domains it exposes get()/update() rather than
// list()/create(). update() writes the whole profile (upsert semantics).
import { apiClient } from './client.js'

export const profileApi = {
  get: () => apiClient.get('/profile'),
  update: (profile) => apiClient.put('/profile', profile),
}
