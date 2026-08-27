import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { cx } from '../../utils/cx'
import Separator from '../ui/Separator'

const SECTIONS = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'account', label: 'Account' },
]

const LINK_CLASSES =
  "relative flex items-center gap-3 p-2 rounded-md no-underline before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-4 before:rounded-full"
const ACTIVE_LINK_CLASSES =
  'text-primary-strong bg-primary-soft font-semibold before:bg-primary-strong'
const INACTIVE_LINK_CLASSES = 'font-medium text-muted-foreground hover:text-foreground hover:bg-surface-muted'

export default function NavigationDrawer({ items, open, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-(--layout-sidebar-width) max-w-[calc(100vw_-_var(--space-16))] pt-6 px-3 pb-[calc(var(--space-4)+env(safe-area-inset-bottom,0px))] border-0 border-l border-border bg-surface text-foreground overflow-y-auto overscroll-contain backdrop:bg-scrim"
      aria-labelledby="drawer-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <header className="flex items-center justify-between gap-2 mb-6">
        <h2 id="drawer-title" className="text-(--font-size-h4)">
          Menu
        </h2>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="inline-flex items-center justify-center w-10 h-10 border-none rounded-md bg-transparent text-foreground cursor-pointer hover:bg-surface-muted"
        >
          <X aria-hidden="true" className="w-(--icon-lg) h-(--icon-lg)" />
        </button>
      </header>
      <nav aria-label="Primary">
        {SECTIONS.map((section, index) => {
          const sectionItems = items.filter((item) => item.section === section.id)
          return (
            <div key={section.id}>
              {index > 0 && <Separator className="my-4" />}
              <p className="m-0 mb-2 px-2 text-muted-foreground text-(--font-size-caption) font-normal uppercase">
                {section.label}
              </p>
              <ul>
                {sectionItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cx(LINK_CLASSES, isActive ? ACTIVE_LINK_CLASSES : INACTIVE_LINK_CLASSES)
                      }
                    >
                      <item.Icon
                        aria-hidden="true"
                        className="w-(--icon-md) h-(--icon-md) shrink-0"
                      />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
    </dialog>
  )
}
