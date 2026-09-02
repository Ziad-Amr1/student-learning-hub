// Note domain API. Each method maps to a Huby backend route and returns the
// parsed `data` from the shared response envelope. Mutations return the
// affected entity so callers update their remote cache without refetching.
import { apiClient } from './client.js'

export const noteApi = {
  list: () => apiClient.get('/notes'),
  create: (note) => apiClient.post('/notes', note),
  update: (id, patch) => apiClient.put(`/notes/${id}`, patch),
  remove: (id) => apiClient.delete(`/notes/${id}`),
}
