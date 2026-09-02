// Task domain API. Each method maps to a Huby backend route and returns the
// parsed `data` from the shared response envelope. Mutations return the
// affected entity so callers update their remote cache without refetching.
import { apiClient } from './client.js'

export const taskApi = {
  list: () => apiClient.get('/tasks'),
  create: (task) => apiClient.post('/tasks', task),
  update: (id, patch) => apiClient.put(`/tasks/${id}`, patch),
  remove: (id) => apiClient.delete(`/tasks/${id}`),
}
