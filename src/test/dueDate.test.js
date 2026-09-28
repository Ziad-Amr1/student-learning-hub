import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getDueState, isIncompleteStatus, INCOMPLETE_TASK_STATUSES } from '../utils/dueDate.js'

// Pure-logic tests for the Sprint 11 Phase 3 due-date contract (D2): overdue is
// status-aware, due-soon is within 3 calendar days, and the comparison is a
// date-only, timezone-stable calendar-day difference. No React, no DOM.
//
// Timezone discipline: every `now` and `dueDate` is built from LOCAL calendar
// arithmetic (`new Date(y, m, d, h)`), so the assertions hold on any machine
// regardless of its UTC offset or DST.

// Friday 2026-09-28 10:15 local.
const NOW = new Date(2026, 8, 28, 10, 15)
const atLocalDate = (dayOffset, hour = 12) =>
  new Date(2026, 8, 28 + dayOffset, hour).toISOString()

const state = (overrides = {}) => getDueState({ dueDate: atLocalDate(1), status: 'unstarted', now: NOW, ...overrides })

test('statuses marked incomplete are exactly unstarted and in-progress (todo aliases)', () => {
  assert.deepEqual(INCOMPLETE_TASK_STATUSES, ['unstarted', 'in-progress'])
  for (const s of ['unstarted', 'in-progress', 'todo']) assert.equal(isIncompleteStatus(s), true)
  for (const s of ['done', 'cancelled', 'deferred']) assert.equal(isIncompleteStatus(s), false)
})

test('past date + unstarted → overdue', () => {
  assert.deepEqual(state({ dueDate: atLocalDate(-1) }), { label: 'Overdue', tone: 'overdue', overdue: true })
})

test('past date + in-progress → overdue', () => {
  assert.deepEqual(state({ dueDate: atLocalDate(-1), status: 'in-progress' }), { label: 'Overdue', tone: 'overdue', overdue: true })
})

test('past date + done → neither (muted, literal date, never "Overdue")', () => {
  const due = atLocalDate(-1)
  const result = state({ dueDate: due, status: 'done' })
  assert.equal(result.overdue, false)
  assert.equal(result.tone, 'muted')
  assert.equal(result.label, `Due ${new Date(due).toLocaleDateString()}`)
})

test('past date + cancelled → neither (muted)', () => {
  const result = state({ dueDate: atLocalDate(-3), status: 'cancelled' })
  assert.deepEqual(result, { label: `Due ${new Date(atLocalDate(-3)).toLocaleDateString()}`, tone: 'muted', overdue: false })
})

test('past date + deferred → neither (muted)', () => {
  const result = state({ dueDate: atLocalDate(-2), status: 'deferred' })
  assert.equal(result.overdue, false)
  assert.equal(result.tone, 'muted')
})

test('today → due-soon, NOT overdue, even when the wall-clock time has passed', () => {
  // Due earlier today (00:30) than `now` (10:15). In any non-UTC timezone the
  // raw `(dueDate - now)` is already negative — the date-only rule must still
  // classify today as due-soon, not overdue.
  const due = new Date(2026, 8, 28, 0, 30).toISOString()
  assert.deepEqual(state({ dueDate: due }), { label: 'Due today', tone: 'warning', overdue: false })
})

test('done + today → neutral "Due today", never due-soon', () => {
  assert.deepEqual(state({ dueDate: atLocalDate(0), status: 'done' }), { label: 'Due today', tone: 'muted', overdue: false })
})

test('tomorrow → due-soon', () => {
  assert.deepEqual(state({ dueDate: atLocalDate(1) }), { label: 'Due tomorrow', tone: 'warning', overdue: false })
})

test('exactly +3 days → due-soon', () => {
  assert.deepEqual(state({ dueDate: atLocalDate(3) }), { label: 'Due in 3 days', tone: 'warning', overdue: false })
})

test('+4 days → neither (muted; the three-day window is closed)', () => {
  assert.deepEqual(state({ dueDate: atLocalDate(4) }), { label: 'Due in 4 days', tone: 'muted', overdue: false })
})

test('+4 days + done → neutral label, muted', () => {
  const result = state({ dueDate: atLocalDate(4), status: 'done' })
  assert.deepEqual(result, { label: 'Due in 4 days', tone: 'muted', overdue: false })
})

test('missing dueDate → null (renders nothing)', () => {
  assert.equal(state({ dueDate: null }), null)
  assert.equal(state({ dueDate: undefined }), null)
  assert.equal(state({ dueDate: '' }), null)
})

test('malformed dueDate → null (renders nothing)', () => {
  assert.equal(state({ dueDate: 'not-a-date' }), null)
  assert.equal(state({ dueDate: '2026-13-45' }), null)
})

test('a date-only string is read as a local calendar day, not UTC midnight', () => {
  // "2026-09-29" must mean "tomorrow wherever the viewer is" — the classic trap
  // is Date('YYYY-MM-DD') parsing as UTC midnight, which is INSIDE today for
  // viewers west of UTC and yields a false 0-day (today) reading.
  assert.deepEqual(state({ dueDate: '2026-09-29' }), { label: 'Due tomorrow', tone: 'warning', overdue: false })
})

test('the calendar-day computation never yields fractional results across the day line', () => {
  // 11:59 PM local yesterday vs 00:01 local today must be a full day apart
  // (overdue), and never "0".
  const due = new Date(2026, 8, 27, 23, 59).toISOString()
  assert.deepEqual(state({ dueDate: due }), { label: 'Overdue', tone: 'overdue', overdue: true })
})