import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { cx } from '../../utils/cx'

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', Icon: Circle },
  { value: 'in-progress', label: 'In Progress', Icon: Clock },
  { value: 'done', label: 'Done', Icon: CheckCircle2 },
]

const STATUS_ICON_STYLE = {
  todo: 'text-muted-foreground',
  'in-progress': 'text-warning-strong',
  done: 'text-success-strong',
}

export default function StatusDropdown({ value, onChange, taskTitle }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const optionRefs = useRef([])

  const currentOption = STATUS_OPTIONS.find(o => o.value === value) ?? STATUS_OPTIONS[0]

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

  const handleButtonKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex(STATUS_OPTIONS.findIndex(o => o.value === value))
    }
  }

  const handleListKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'Down':
        e.preventDefault()
        setActiveIndex(i => (i + 1) % STATUS_OPTIONS.length)
        break
      case 'ArrowUp':
      case 'Up':
        e.preventDefault()
        setActiveIndex(i => (i - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (activeIndex >= 0) {
          onChange(STATUS_OPTIONS[activeIndex].value)
          close()
        }
        break
      case 'Escape':
        e.preventDefault()
        close()
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
        <currentOption.Icon className={cx('w-3 h-3 shrink-0', STATUS_ICON_STYLE[value])} aria-hidden="true" />
        <span className="leading-none">{currentOption.label}</span>
        <ChevronDown className={cx('w-3 h-3 shrink-0 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Select status"
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className={cx(
            'absolute z-50 mt-1 right-0 min-w-[140px]',
            'bg-surface border border-border rounded-lg shadow-lg py-1',
            'overflow-hidden focus:outline-none'
          )}
        >
          {STATUS_OPTIONS.map((option, index) => {
            const OptionIcon = option.Icon
            const isSelected = option.value === value
            const isActive = index === activeIndex
            return (
              <li
                key={option.value}
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
