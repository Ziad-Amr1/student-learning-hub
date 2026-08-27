// Learning Workspace domain constants — Sprint 07.6.
// Single source for the LearningEntry status/category vocabularies and their
// visual mappings. Pure static maps: no React, no DOM, no logic.
// NOTE: learning goals deliberately diverge from the task status mapping —
// their in-progress state has NO time-caution semantics, so it uses `accent`
// (NOT the task `warning`); `not-started` is a neutral `secondary` badge.
// Documented in DESIGN_SYSTEM.md (learning statuses) + AGENTS.md §4.

export const LEARNING_CATEGORIES = ['course', 'book', 'practice', 'video', 'topic']

export const LEARNING_CATEGORY_LABELS = {
  course: 'Course',
  book: 'Book',
  practice: 'Practice',
  video: 'Video',
  topic: 'Topic',
}

export const LEARNING_STATUSES = ['not-started', 'in-progress', 'paused', 'completed']

export const LEARNING_STATUS_LABELS = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  paused: 'Paused',
  completed: 'Completed',
}

export const LEARNING_STATUS_VISUALS = {
  'not-started': {
    badgeVariant: 'secondary',
    borderClass: '',
    bgClass: '',
  },

  'in-progress': {
    badgeVariant: 'accent',
    borderClass: 'border-l-accent',
    bgClass: '!bg-accent-soft/20',
  },

  paused: {
    badgeVariant: 'info',
    borderClass: 'border-l-info',
    bgClass: '!bg-info-soft/20',
  },

  completed: {
    badgeVariant: 'success',
    borderClass: 'border-l-success',
    bgClass: '!bg-success-soft/20',
  },
}

export const LEARNING_CATEGORY_BADGE_VARIANT = 'secondary'