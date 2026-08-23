import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import './Navbar.css'

export default function Navbar({ items, onMenuClick }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <button
          type="button"
          className="navbar__menu-button"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
        >
          <Menu aria-hidden="true" />
        </button>
        <NavLink to="/dashboard" className="navbar__brand">
          Huby<span className="navbar__brand-dot">.</span>
        </NavLink>
      </div>
    </header>
  )
}
