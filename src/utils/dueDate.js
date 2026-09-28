// Task due-date semantics — status-aware overdue / due-soon detection.
// Pure, no React/DOM. Single source for TaskCard and TaskDetailsDialog so the
// date comparisons are never duplicated across components (Sprint 11 Phase 3).
import { normalizeTaskStatus } from './taskStatus.js'

export const INCOMPLETE_TASK_STATUSES = ['unstarted', 'in-progress']
export const isIncompleteStatus = (status) =>
  INCOMPLETE_TASK_STATUSES.includes(normalizeTaskStatus(status))

const MS_PER_DAY = 86_400_000

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

// A date-only string ("2026-09-28") means "that calendar day, wherever you
// are", so it is built as LOCAL midnight on purpose instead of relying on
// Date's UTC parse. Full ISO instants (what the Tasks form stores) fall
// through to the normal constructor.
const parseDueDate = (value) => {
  if (!value) return null
  const match = DATE_ONLY.exec(value)
  let date
  if (match) {
    const year = +match[1]
    const month = +match[2]
    const day = +match[3]
    if (month < 1 || month > 12 || day < 1 || day > 31) return null
    date = new Date(year, month - 1, day)
    // Reject rollovers such as "2026-02-30" (⇒ Mar 2) and "2026-13-01".
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null
    }
  } else {
    date = new Date(value)
  }
  return Number.isNaN(date.getTime()) ? null : date
}

// Both sides are reduced to their LOCAL calendar day number (local midnight on
// the epoch day-line). Because the due date and "today" go through the same
// transform, the difference is an exact whole-calendar-day value with no
// dependency on the viewer's UTC offset or DST.
const localDayNumber = (date) => {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor(dayStart.getTime() / MS_PER_DAY)
}

// Returns null when there is no dueDate or it is malformed. Otherwise
// { label, tone, overdue } with tone ∈ 'overdue' | 'warning' | 'muted':
//   overdue    ⟺ isIncomplete(status) && daysUntilDue <  0
//   due-soon   ⟺ isIncomplete(status) && 0 <= daysUntilDue <= 3
//   everything else is neutral (muted); done / cancelled / deferred are never
//   overdue or due-soon, and never display the word "Overdue" — a past date on
//   a completed task renders as the literal calendar date instead.
export function getDueState({ dueDate, status, now = new Date() }) {
  const due = parseDueDate(dueDate)
  if (!due) return null

  const incomplete = isIncompleteStatus(status)
  const daysUntilDue = localDayNumber(due) - localDayNumber(now)

  if (!incomplete) {
    if (daysUntilDue < 0) {
      return { label: `Due ${due.toLocaleDateString()}`, tone: 'muted', overdue: false }
    }
    return { label: labelFor(daysUntilDue), tone: 'muted', overdue: false }
  }

  if (daysUntilDue < 0) {
    return { label: 'Overdue', tone: 'overdue', overdue: true }
  }
  if (daysUntilDue <= 3) {
    return { label: labelFor(daysUntilDue), tone: 'warning', overdue: false }
  }
  return { label: labelFor(daysUntilDue), tone: 'muted', overdue: false }
}

const labelFor = (daysUntilDue) => {
  if (daysUntilDue === 0) return 'Due today'
  if (daysUntilDue === 1) return 'Due tomorrow'
  return `Due in ${daysUntilDue} days`
}