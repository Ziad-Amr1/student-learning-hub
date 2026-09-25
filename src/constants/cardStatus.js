import { CheckCircle2, Circle, Clock, PauseCircle, XCircle } from 'lucide-react'

export const PRIORITY_VARIANT = {
  low: 'outline',
  medium: 'info',
  high: 'danger',
}

// Status icons + their color styles — shared by TaskCard and the read-only
// task details dialog. `in-progress` uses the warning color deliberately
// (active attention), NOT the task-status warning conflation rule.
export const STATUS_ICON_BY_STATUS = {
  unstarted: Circle,
  'in-progress': Clock,
  deferred: PauseCircle,
  done: CheckCircle2,
  cancelled: XCircle,
}

export const STATUS_ICON_STYLE = {
  unstarted: 'text-muted-foreground',
  'in-progress': 'text-warning-strong',
  deferred: 'text-info-strong',
  done: 'text-success-strong',
  cancelled: 'text-destructive-strong',
}

export const STATUS_VISUALS = {
  unstarted: {
    badgeVariant: 'accent',
    borderClass: 'border-l-accent/40',
    bgClass: '',
  },

  'in-progress': {
    badgeVariant: 'warning',
    borderClass: 'border-l-warning',
    bgClass: '!bg-warning-soft/20',
  },

  deferred: {
    badgeVariant: 'info',
    borderClass: 'border-l-info',
    bgClass: '!bg-info-soft/20',
  },

  done: {
    badgeVariant: 'success',
    borderClass: 'border-l-success',
    bgClass: '!bg-success-soft/20',
  },

  cancelled: {
    badgeVariant: 'danger',
    borderClass: 'border-l-destructive',
    bgClass: '!bg-destructive-soft/20',
  },
}

export const PINNED_CARD_VISUAL = {
  borderClass: 'border-l-2 border-l-accent',
  bgClass: '!bg-accent-soft/20',
}

export const PIN_BUTTON_ACTIVE_CLASSES =
  '!bg-primary-soft text-primary-strong hover:not-disabled:!bg-primary-soft/80'