import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { ChevronDown, Circle, Clock, CheckCircle2, PauseCircle, XCircle } from 'lucide-react'
import { cx } from '../../utils/cx'
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  normalizeTaskStatus,
} from '../../utils/taskStatus'

const STATUS_ICON_BY_STATUS = {
  unstarted: Circle,
  'in-progress': Clock,
  deferred: PauseCircle,
  done: CheckCircle2,
  cancelled: XCircle,
}

const STATUS_OPTIONS = TASK_STATUSES.map((value) => ({
  value,
  label: TASK_STATUS_LABELS[value],
  Icon: STATUS_ICON_BY_STATUS[value],
}))

const STATUS_ICON_STYLE = {
  unstarted: 'text-muted-foreground',
  'in-progress': 'text-warning-strong',
  deferred: 'text-info-strong',
  done: 'text-success-strong',
  cancelled: 'text-destructive-strong',
}

export default function StatusDropdown({ value, onChange, taskTitle }) {
  const status = normalizeTaskStatus(value) ?? TASK_STATUSES[0]
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const optionRefs = useRef([])
  const baseId = useId()

  const listboxId = `${baseId}-listbox`

  const currentOption = STATUS_OPTIONS.find(o => o.value === status) ?? STATUS_OPTIONS[0]

  const close = useCallback(() => {
    setOpen(false)
    setActiveIndex(-1)
    buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const handlePointer = (e) => {
      if (buttonRef.current?.contains(e.target)) return
      if (listRef.current?.contains(e.target)) return
      close()
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [open, close])

  useEffect(() => {
    if (open && activeIndex >= 0 && optionRefs.current[activeIndex]) {
      optionRefs.current[activeIndex].scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, open])

  // ARIA 1.2 combobox: focus stays on the trigger button; the open listbox is
  // described via aria-activedescendant (the interim pattern — the full
  // focus-trap Dropdown is Sprint 14 scope).
  const handleButtonKeyDown = (e) => {
    const currentIndex = STATUS_OPTIONS.findIndex(o => o.value === status)
    switch (e.key) {
      case 'ArrowDown':
      case 'Down':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setActiveIndex(currentIndex)
        } else {
          setActiveIndex(i => (i + 1) % STATUS_OPTIONS.length)
        }
        break
      case 'ArrowUp':
      case 'Up':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setActiveIndex(currentIndex)
        } else {
          setActiveIndex(i => (i - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length)
        }
        break
      case 'Home':
      case 'End':
        if (open) {
          e.preventDefault()
          setActiveIndex(e.key === 'Home' ? 0 : STATUS_OPTIONS.length - 1)
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) {
          if (activeIndex >= 0) {
            onChange(STATUS_OPTIONS[activeIndex].value)
          }
          close()
        } else {
          setOpen(true)
          setActiveIndex(currentIndex)
        }
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          close()
        }
        break
      case 'Tab':
        close()
        break
      default:
        break
    }
  }

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined
        }
        aria-label={`Status for "${taskTitle}"`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleButtonKeyDown}
        className={cx(
          'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm cursor-pointer',
          'bg-surface border-input text-foreground transition-colors',
          'hover:bg-surface-muted',
          'focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-soft)] focus:outline-none'
        )}
      >
        <currentOption.Icon className={cx('w-3 h-3 shrink-0', STATUS_ICON_STYLE[status])} aria-hidden="true" />
        <span className="leading-none">{currentOption.label}</span>
        <ChevronDown className={cx('w-3 h-3 shrink-0 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Select status"
          className={cx(
            'absolute z-(--z-dropdown) mt-1 right-0 min-w-[140px] overflow-hidden',
            'bg-surface border border-border rounded-lg shadow-lg py-1'
          )}
        >
          {STATUS_OPTIONS.map((option, index) => {
            const OptionIcon = option.Icon
            const isSelected = option.value === status
            const isActive = index === activeIndex
            return (
              <li
                key={option.value}
                id={`${baseId}-option-${index}`}
                ref={(el) => { optionRefs.current[index] = el }}
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(option.value); close() }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cx(
                  'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-primary-soft text-primary-strong font-medium'
                    : 'text-foreground',
                  isActive && !isSelected && 'bg-surface-muted'
                )}
              >
                <OptionIcon className={cx('w-3 h-3 shrink-0', STATUS_ICON_STYLE[option.value])} aria-hidden="true" />
                {option.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}