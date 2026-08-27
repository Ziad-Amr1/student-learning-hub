export const TASK_STATUSES = [
  'unstarted',
  'in-progress',
  'deferred',
  'done',
  'cancelled',
]

export const TASK_STATUS_LABELS = {
  unstarted: 'Unstarted',
  'in-progress': 'In Progress',
  deferred: 'Deferred',
  done: 'Done',
  cancelled: 'Cancelled',
}

const LEGACY_STATUS_ALIASES = {
  todo: 'unstarted',
}

export const normalizeTaskStatus = (status) =>
  LEGACY_STATUS_ALIASES[status] ?? status