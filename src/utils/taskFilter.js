// Pure filtering logic for the Tasks page (Sprint 11 phase 2). Extracted from
// Tasks.jsx so the toolbar contract is testable without React or a DOM, and so
// the additive AND semantics live in exactly one place.
//
// Filter options are DERIVED from the loaded task data — there is no category
// vocabulary in the product, so the only honest list of options is the set the
// user has actually used. This mirrors the established Resources pattern
// (Resources.jsx: `['all', ...new Set(items.map(...))]`): "all" first, then the
// values in order of first appearance.
//
// Case is significant: `Task.category` is a free-text label that the Model only
// trims, so "Exam prep" and "exam prep" are two different categories by design
// (unlike Note tags, which are lowercased in phase 4).

export const TASK_CATEGORY_ALL = 'all'

const compareStrings = (a, b) => a.localeCompare(b)

const normalizeTaskStatus = (status) => (status === 'todo' ? 'unstarted' : status)

/**
 * Filter option values for the category filter: 'all' followed by every
 * distinct category present in `tasks`, in order of first appearance. Tasks
 * with no category contribute nothing, so an empty list yields just ['all'].
 */
export function taskCategoryOptions(tasks = []) {
  return [
    TASK_CATEGORY_ALL,
    ...new Set(
      tasks
        .map((task) => task.category)
        .filter((category) => typeof category === 'string' && category.length > 0),
    ),
  ]
}

/**
 * Additive AND filter: a task is kept only when it satisfies EVERY active
 * criterion, where "all" (or an empty query) matches everything. Sort order is
 * never considered — sorting is applied afterwards by sortTasks().
 */
export function filterTasks(tasks = [], { query = '', status = 'all', priority = 'all', category = TASK_CATEGORY_ALL } = {}) {
  const needle = query.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchesSearch = !needle || task.title.toLowerCase().includes(needle)
    const matchesStatus = status === 'all' || normalizeTaskStatus(task.status) === status
    const matchesPriority = priority === 'all' || task.priority === priority
    const matchesCategory = category === TASK_CATEGORY_ALL || task.category === category
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })
}
