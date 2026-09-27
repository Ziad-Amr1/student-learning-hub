// My Library domain API. Each method maps to a Huby backend route and returns
// the parsed `data` from the shared response envelope. Mutations return the
// affected book so callers update their remote cache without refetching.
import { apiClient } from './client.js'

export const libraryApi = {
  list: () => apiClient.get('/library'),
  create: (entry) => apiClient.post('/library', entry),
  update: (id, patch) => apiClient.put(`/library/${id}`, patch),
  remove: (id) => apiClient.delete(`/library/${id}`),
}