import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cx } from '../../utils/cx'

// Shared disclosure primitive (hand-rolled, no new dependency — phase-0
// decision 3). A trigger <button> owns `aria-expanded` + `aria-controls`, and
// the panel is a labelled region, so the relationship is exposed to assistive
// tech without ARIA roles beyond the button. Keyboard behavior is native: the
// button is focusable and activates on Enter/Space, and the panel is not
// focusable itself (its contents are, in DOM order, immediately after the
// trigger).
//
// `defaultOpen` seeds UNCONTROLLED open state, so a caller that wants the
// section to start closed simply omits it — that is the default and the reason
// this primitive exists (long optional form sections must not dominate a
// dialog). Pass `open` + `onOpenChange` for a controlled section.
//
// `summary` is the always-visible trigger content; `meta` is an optional short
// trailing caption (e.g. "3 linked") that stays visible while collapsed.
const TRIGGER_CLASSES =
  'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 ' +
  'text-left cursor-pointer bg-surface-muted border border-border ' +
  'transition-[background-color,border-color] duration-150 ease-standard ' +
  'hover:bg-secondary focus-visible:border-primary ' +
  'focus-visible:shadow-[0_0_0_3px_var(--ring-soft)] focus-visible:outline-none'

const CHEVRON_CLASSES =
  'w-(--icon-sm) h-(--icon-sm) shrink-0 text-muted-foreground transition-transform duration-150 ease-standard'

export default function Collapsible({
  summary,
  meta,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  panelClassName,
}) {
  const panelId = useId()
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = isControlled ? controlledOpen : internalOpen

  const handleToggle = () => {
    const next = !open
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={handleToggle}
        className={TRIGGER_CLASSES}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-label text-foreground">{summary}</span>
          {meta ? (
            <span className="truncate text-caption text-muted-foreground">{meta}</span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden="true"
          data-state={open ? 'open' : 'closed'}
          className={cx(CHEVRON_CLASSES, open && 'rotate-180')}
        />
      </button>
      <div id={panelId} hidden={!open} className={cx('min-w-0', panelClassName)}>
        {open ? children : null}
      </div>
    </div>
  )
}
