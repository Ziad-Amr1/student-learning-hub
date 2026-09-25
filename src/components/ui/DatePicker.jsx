import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cx } from '../../utils/cx'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'
import Calendar from './Calendar'

// Shared shadcn-style DatePicker — JS port of the shadcn/ui date-picker
// rebuild on the shared Popover + Calendar primitives. Delivered as part of
// the shared shadcn cleanup WITHOUT a consumer yet (Tasks due dates remain
// datetime-local); documented for the future Calendar feature (PROJECT_PLAN
// Future Product Direction, group 4) and any future date-selection UI.

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  ...props
}) {
  const triggerLabel = value ? `Date: ${format(value, 'PPP')}` : placeholder

  return (
    <Popover>
      <PopoverTrigger
        aria-label={triggerLabel}
        className={cx(
          'inline-flex items-center justify-between gap-2 rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground cursor-pointer',
          'transition-[border-color,box-shadow] duration-150 ease-standard',
          'focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-soft)] focus:outline-none',
          className
        )}
        {...props}
      >
        <CalendarIcon
          aria-hidden="true"
          className="w-(--icon-sm) h-(--icon-sm) shrink-0 text-muted-foreground"
        />
        {value ? (
          <span>{format(value, 'PPP')}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  )
}