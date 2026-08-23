import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { cx } from '../../utils/cx'
import Separator from '../ui/Separator'
import './NavigationDrawer.css'

const SECTIONS = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'account', label: 'Account' },
]

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
      className="drawer"
      aria-labelledby="drawer-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <header className="drawer__header">
        <h2 id="drawer-title">Menu</h2>
        <button
          type="button"
          className="drawer__close"
          aria-label="Close navigation menu"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
      </header>
      <nav className="drawer__nav" aria-label="Primary">
        {SECTIONS.map((section, index) => {
          const sectionItems = items.filter((item) => item.section === section.id)
          return (
            <div key={section.id} className="drawer__group">
              {index > 0 && <Separator className="drawer__divider" />}
              <p className="drawer__heading">{section.label}</p>
              <ul className="drawer__list">
                {sectionItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cx('drawer__link', isActive && 'drawer__link--active')
                      }
                    >
                      <item.Icon aria-hidden="true" />
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
