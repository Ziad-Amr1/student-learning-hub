import { NavLink } from 'react-router-dom'
import { cx } from '../../utils/cx'
import './MobileNav.css'

export default function MobileNav({ items }) {
  return (
    <nav className="mobile-nav" aria-label="Primary">
      <ul className="mobile-nav__list">
        {items.map((item) => (
          <li key={item.to} className="mobile-nav__item">
            <NavLink
              to={item.to}
              aria-label={item.label}
              title={item.label}
              className={({ isActive }) =>
                cx('mobile-nav__link', isActive && 'mobile-nav__link--active')
              }
            >
              <item.Icon aria-hidden="true" />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
