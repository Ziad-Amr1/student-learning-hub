// Thin HTTP client for the Huby backend. Owns the base URL (from
// VITE_API_URL, falling back to the local dev API) and the shared JSON
// envelope parsing. Components must NOT call fetch directly — they use the
// domain modules in src/api and the remote-state hook useRemote.

const BASE_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:5000/api'

async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    // A thrown fetch (connection refused, DNS failure, mixed-content block on
    // the static GitHub Pages build) is a TRANSPORT failure, not an HTTP error.
    // Tag it so callers can fall back to seed data instead of erroring out.
    const error = new Error('Could not reach the Huby backend.')
    error.isNetworkError = true
    error.cause = cause
    throw error
  }

  let json = {}
  try {
    json = await response.json()
  } catch {
    // non-JSON response — fall through to status-based handling
  }

  if (!response.ok || json.success === false) {
    const message =
      json.message || `Request failed with status ${response.status}`
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return json.data
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
