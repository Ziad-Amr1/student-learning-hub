import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cx } from '../../utils/cx'
import Separator from '../ui/Separator'
import './Sidebar.css'

const SECTIONS = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'account', label: 'Account' },
]

export default function Sidebar({ items }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cx('sidebar', collapsed && 'sidebar--collapsed')}>
      <nav className="sidebar__nav" aria-label="Primary">
        {SECTIONS.map((section, index) => {
          const sectionItems = items.filter((item) => item.section === section.id)
          return (
            <div key={section.id} className="sidebar__group">
              {index > 0 && <Separator className="sidebar__divider" />}
              <p className="sidebar__heading">{section.label}</p>
              <ul className="sidebar__list">
                {sectionItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      title={item.label}
                      aria-label={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cx('sidebar__link', isActive && 'sidebar__link--active')
                      }
                    >
                      <item.Icon aria-hidden="true" />
                      <span className="sidebar__label">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
      <button
        type="button"
        className="sidebar__toggle"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        <span className="sidebar__label">Collapse</span>
      </button>
    </aside>
  )
}
