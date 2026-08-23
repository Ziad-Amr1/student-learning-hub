import { NavLink } from 'react-router-dom'
import { cx } from '../../utils/cx'
import './Navbar.css'

export default function Navbar({ items }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/dashboard" className="navbar__brand">
          Huby<span className="navbar__brand-dot">.</span>
        </NavLink>
        <nav className="navbar__links" aria-label="Primary">
          <ul className="navbar__list">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cx('navbar__link', isActive && 'navbar__link--active')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
