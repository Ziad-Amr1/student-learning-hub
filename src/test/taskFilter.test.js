import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  filterTasks,
  taskCategoryOptions,
  TASK_CATEGORY_ALL,
} from '../utils/taskFilter.js'

// Pure-logic tests for the Tasks toolbar contract (Sprint 11 phase 2): the
// data-derived category options and the additive AND filter pipeline. No React
// and no DOM, so it runs in the same `node:test` gate as the backend.

const task = (overrides = {}) => ({
  id: 'task-1',
  title: 'A task',
  description: '',
  priority: 'medium',
  status: 'unstarted',
  dueDate: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
})

const ALL_FILTERS = { query: '', status: 'all', priority: 'all', category: TASK_CATEGORY_ALL }

// --- category options ---------------------------------------------------------

test('taskCategoryOptions derives distinct values from the data, all first', () => {
  const tasks = [
    task({ category: 'Exam prep' }),
    task({ category: 'Labs' }),
    task({ category: 'Exam prep' }),
  ]
  assert.deepEqual(taskCategoryOptions(tasks), [TASK_CATEGORY_ALL, 'Exam prep', 'Labs'])
})

test('taskCategoryOptions skips uncategorized tasks and yields only "all" when empty', () => {
  assert.deepEqual(taskCategoryOptions([task(), task({})]), [TASK_CATEGORY_ALL])
  assert.deepEqual(taskCategoryOptions([]), [TASK_CATEGORY_ALL])
  assert.deepEqual(taskCategoryOptions(), [TASK_CATEGORY_ALL], 'no argument must be safe')
})

test('taskCategoryOptions treats case as significant (free-text labels)', () => {
  const tasks = [task({ category: 'React' }), task({ category: 'react' })]
  assert.deepEqual(taskCategoryOptions(tasks), [TASK_CATEGORY_ALL, 'React', 'react'])
})

// --- the AND pipeline ---------------------------------------------------------

test('an unset filter keeps every task', () => {
  const tasks = [
    task({ id: 'a', title: 'One' }),
    task({ id: 'b', title: 'Two', category: 'Labs' }),
  ]
  assert.equal(filterTasks(tasks, ALL_FILTERS).length, 2)
  assert.equal(filterTasks(tasks).length, 2, 'default options must keep everything')
  assert.equal(filterTasks(tasks, { ...ALL_FILTERS, query: '   ' }).length, 2, 'blank query is absent')
})

test('search matches the title case-insensitively', () => {
  const tasks = [task({ id: 'a', title: 'Revise Graphs' }), task({ id: 'b', title: 'Buy milk' })]
  assert.deepEqual(
    filterTasks(tasks, { ...ALL_FILTERS, query: 'graphs' }).map((t) => t.id),
    ['a'],
  )
})

test('category filter matches exactly and excludes uncategorized tasks', () => {
  const tasks = [
    task({ id: 'a', category: 'Exam prep' }),
    task({ id: 'b', category: 'Labs' }),
    task({ id: 'c' }),
  ]
  assert.deepEqual(
    filterTasks(tasks, { ...ALL_FILTERS, category: 'Exam prep' }).map((t) => t.id),
    ['a'],
  )
  assert.deepEqual(
    filterTasks(tasks, { ...ALL_FILTERS, category: 'Labs' }).map((t) => t.id),
    ['b'],
  )
  assert.equal(
    filterTasks(tasks, { ...ALL_FILTERS, category: 'Exam prep' }).some((t) => t.id === 'c'),
    false,
    'a task with no category must not match a specific category',
  )
})

test('the legacy "todo" status still reads as "unstarted" in the status filter', () => {
  const tasks = [task({ id: 'a', status: 'todo' }), task({ id: 'b', status: 'done' })]
  assert.deepEqual(
    filterTasks(tasks, { ...ALL_FILTERS, status: 'unstarted' }).map((t) => t.id),
    ['a'],
  )
})

test('filters combine with AND, never OR', () => {
  const tasks = [
    task({ id: 'match', title: 'Revise', category: 'Labs', priority: 'high', status: 'in-progress' }),
    task({ id: 'wrong-category', title: 'Revise', category: 'Exam prep', priority: 'high', status: 'in-progress' }),
    task({ id: 'wrong-priority', title: 'Revise', category: 'Labs', priority: 'low', status: 'in-progress' }),
    task({ id: 'wrong-status', title: 'Revise', category: 'Labs', priority: 'high', status: 'done' }),
    task({ id: 'wrong-title', title: 'Buy milk', category: 'Labs', priority: 'high', status: 'in-progress' }),
  ]

  const filters = { query: 'revise', status: 'in-progress', priority: 'high', category: 'Labs' }
  assert.deepEqual(
    filterTasks(tasks, filters).map((t) => t.id),
    ['match'],
    'only the task satisfying every criterion survives',
  )

  // Dropping any single criterion must widen the result, never narrow it.
  assert.equal(filterTasks(tasks, { ...filters, query: '' }).length, 2)
  assert.equal(filterTasks(tasks, { ...filters, category: TASK_CATEGORY_ALL }).length, 2)
  assert.equal(filterTasks(tasks, { ...filters, priority: 'all' }).length, 2)
  assert.equal(filterTasks(tasks, { ...filters, status: 'all' }).length, 2)
})

test('a filter combination that matches nothing returns an empty list', () => {
  const tasks = [task({ category: 'Labs', priority: 'low' })]
  assert.deepEqual(
    filterTasks(tasks, { ...ALL_FILTERS, category: 'Labs', priority: 'high' }),
    [],
  )
})

test('filtering does not mutate the input list', () => {
  const tasks = [task({ id: 'a', title: 'One' }), task({ id: 'b', title: 'Two' })]
  const before = [...tasks]
  filterTasks(tasks, { ...ALL_FILTERS, query: 'one' })
  assert.deepEqual(tasks, before)
})
