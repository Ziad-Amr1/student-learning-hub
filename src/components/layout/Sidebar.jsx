import { NavLink } from 'react-router-dom'
import { cx } from '../../utils/cx'
import './Sidebar.css'

const SECTIONS = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'account', label: 'Account' },
]

export default function Sidebar({ items }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label="Primary">
        {SECTIONS.map((section) => {
          const sectionItems = items.filter((item) => item.section === section.id)
          return (
            <div key={section.id} className="sidebar__section">
              <p className="sidebar__heading">{section.label}</p>
              <ul className="sidebar__list">
                {sectionItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cx('sidebar__link', isActive && 'sidebar__link--active')
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
