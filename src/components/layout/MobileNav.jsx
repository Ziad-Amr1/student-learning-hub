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
              className={({ isActive }) =>
                cx('mobile-nav__link', isActive && 'mobile-nav__link--active')
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
