// Shared date/time utilities — pure functions, no React dependency.
// Per ARCHITECTURE.md: utils/ owns pure helpers independent of React/DOM.

export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateString).toLocaleDateString()
}

export function formatDueDate(dueDate) {
  if (!dueDate) return null
  const date = new Date(dueDate)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  if (diff <= 0) return { label: 'Overdue', overdue: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return { label: 'Due today', overdue: false }
  if (days === 1) return { label: 'Due tomorrow', overdue: false }
  return { label: `Due in ${days} days`, overdue: false }
}
