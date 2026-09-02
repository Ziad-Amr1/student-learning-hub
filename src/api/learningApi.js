// Learning domain API. Each method maps to a Huby backend route and returns the
// parsed `data` from the shared response envelope. Mutations return the
// affected entity so callers update their remote cache without refetching.
import { apiClient } from './client.js'

export const learningApi = {
  list: () => apiClient.get('/learning'),
  create: (entry) => apiClient.post('/learning', entry),
  update: (id, patch) => apiClient.put(`/learning/${id}`, patch),
  remove: (id) => apiClient.delete(`/learning/${id}`),
}
