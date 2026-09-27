// My Library domain constants — 2026-09-27.
// Single source for the LibraryEntry status vocabulary and its visual
// mapping. Pure static maps: no React, no DOM, no logic.
// Reads mirror the Learning status-dressing conventions: `reading` is an
// active, aspirational state → accent (NOT the task `warning`, which carries a
// time-caution meaning). `finished` and `dnf` carry full-card tints (success /
// info), the neutral states stay untinted. Library books have no pin in MVP,
// so no card owns the PINNED_CARD_VISUAL accent border — statuses keep only
// their Badge variant plus optional tint (status-vs-pin collision that
// learning guards against cannot occur here).
// Documented in DESIGN_SYSTEM.md (library statuses) + AGENTS.md §4.

export const LIBRARY_STATUSES = ['want-to-read', 'reading', 'finished', 'dnf']

export const LIBRARY_STATUS_LABELS = {
  'want-to-read': 'Want to Read',
  reading: 'Reading',
  finished: 'Finished',
  dnf: 'Did Not Finish',
}

export const LIBRARY_STATUS_VISUALS = {
  'want-to-read': {
    badgeVariant: 'secondary',
    borderClass: '',
    bgClass: '',
  },

  reading: {
    badgeVariant: 'accent',
    borderClass: '',
    bgClass: '',
  },

  finished: {
    badgeVariant: 'success',
    borderClass: '',
    bgClass: '!bg-success-soft/20',
  },

  dnf: {
    badgeVariant: 'info',
    borderClass: '',
    bgClass: '!bg-info-soft/20',
  },
}

export const LIBRARY_MAX_RATING = 5