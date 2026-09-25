import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cx } from '../../utils/cx'

// Shared shadcn-style Calendar primitive — JS port of the shadcn/ui calendar
// rebuilt on the installed react-day-picker v10 API and Huby tokens. Content
// height/selection states live on the day BUTTON (custom DayButton), so
// hover/focus/selected visuals are applied to the focusable element; the td
// cells carry the grid semantics plus outside/disabled emphasis. Installed as
// part of the shared shadcn cleanup WITHOUT a consumer yet: the Tasks due date
// stays a datetime-local input (a date-only picker would drop the time
// component — a data-model decision). Ready for the future Calendar feature
// (PROJECT_PLAN Future Product Direction, group 4) and any date-selection UI.

const NAV_BUTTON_CLASSES =
  'absolute inline-flex items-center justify-center w-7 h-7 p-0 rounded-md border border-input ' +
  'bg-surface text-foreground cursor-pointer ' +
  'transition-[background-color,border-color,color] duration-150 ease-standard ' +
  'hover:not-disabled:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed'

function DayButton({ modifiers, className, ...props }) {
  const stateClass = modifiers.selected
    ? 'bg-primary text-primary-foreground hover:not-disabled:bg-primary-hover'
    : modifiers.today
      ? 'bg-accent text-accent-foreground hover:not-disabled:bg-accent-hover'
      : 'hover:not-disabled:bg-surface-muted'
  return <button type="button" className={cx(className, stateClass)} {...props} />
}

function Chevron({ orientation, className, ...props }) {
  const Icon = orientation === 'left' || orientation === 'up' ? ChevronLeft : ChevronRight
  return (
    <Icon
      aria-hidden="true"
      className={cx('w-(--icon-sm) h-(--icon-sm)', className)}
      {...props}
    />
  )
}

export default function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cx('p-3', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        button_previous: cx(NAV_BUTTON_CLASSES, 'left-1'),
        button_next: cx(NAV_BUTTON_CLASSES, 'right-1'),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-8 font-normal text-caption text-center',
        week: 'flex w-full mt-2',
        day: 'relative p-0 text-center text-sm',
        day_button: 'w-8 h-8 p-0 font-normal transition-colors duration-150 ease-standard rounded-md',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{ Chevron, DayButton }}
      {...props}
    />
  )
}