export const TASK_PRIORITY_RANK = { high: 3, medium: 2, low: 1 }

export const TASK_SORT_OPTIONS = [
  { value: 'manual', label: 'Manual order' },
  { value: 'createdAt', label: 'Newest first' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title A–Z' },
]

const compareStrings = (a, b) => a.localeCompare(b)

const compareCreatedAt = (a, b) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

const compareDueDate = (a, b) => {
  const aTime = a.dueDate
    ? new Date(a.dueDate).getTime()
    : Number.POSITIVE_INFINITY
  const bTime = b.dueDate
    ? new Date(b.dueDate).getTime()
    : Number.POSITIVE_INFINITY
  return aTime - bTime
}

const comparePriority = (a, b) =>
  (TASK_PRIORITY_RANK[b.priority] ?? 0) - (TASK_PRIORITY_RANK[a.priority] ?? 0)

const compareId = (a, b) => compareStrings(a.id, b.id)

export function sortTasks(tasks, sort) {
  const list = [...tasks]
  if (sort === 'manual' || sort === undefined) return list
  return list.sort((a, b) => {
    switch (sort) {
      case 'title':
      case 'dueDate':
      case 'priority':
        return compareSecondary(a, b, sort)
      case 'createdAt':
      default:
        return compareCreatedAt(a, b) || compareId(a, b)
    }
  })
}

function compareSecondary(a, b, mode) {
  const primary =
    mode === 'title'
      ? compareStrings(a.title, b.title)
      : mode === 'dueDate'
        ? compareDueDate(a, b)
        : comparePriority(a, b)
  if (primary !== 0) return primary
  return compareCreatedAt(a, b) || compareId(a, b)
}