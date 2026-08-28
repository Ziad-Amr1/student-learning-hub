// Learning Workspace domain constants — Sprint 07.6.
// Single source for the LearningEntry status/category vocabularies and their
// visual mappings. Pure static maps: no React, no DOM, no logic.
// NOTE: learning goals deliberately diverge from the task status mapping —
// their in-progress state has NO time-caution semantics, so it uses `accent`
// (NOT the task `warning`); `not-started` is a neutral `secondary` badge.
// After the 07.6 refinement, statuses own NO card border — the card's
// `border-l-2` accent border + accent tint belong to PINNING exclusively
// (PINNED_CARD_VISUAL in constants/cardStatus.js), so a pinned in-progress
// card can never collide with the in-progress status accent. Statuses keep
// only their Badge variant plus a full-card tint for paused (info) and
// completed (success).
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
    borderClass: '',
    bgClass: '',
  },

  paused: {
    badgeVariant: 'info',
    borderClass: '',
    bgClass: '!bg-info-soft/20',
  },

  completed: {
    badgeVariant: 'success',
    borderClass: '',
    bgClass: '!bg-success-soft/20',
  },
}

export const LEARNING_CATEGORY_BADGE_VARIANT = 'secondary'