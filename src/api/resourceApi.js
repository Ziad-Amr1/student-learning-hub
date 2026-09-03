// Resource domain API. Each method maps to a Huby backend route and returns
// the parsed `data` from the shared response envelope. Mutations return the
// affected entity so callers update their remote cache without refetching.
import { apiClient } from './client.js'

export const resourceApi = {
  list: () => apiClient.get('/resources'),
  create: (resource) => apiClient.post('/resources', resource),
  update: (id, patch) => apiClient.put(`/resources/${id}`, patch),
  remove: (id) => apiClient.delete(`/resources/${id}`),
}
