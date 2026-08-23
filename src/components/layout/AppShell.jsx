import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Container from './Container'
import './AppShell.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', section: 'workspace' },
  { to: '/tasks', label: 'Tasks', section: 'workspace' },
  { to: '/notes', label: 'Notes', section: 'workspace' },
  { to: '/resources', label: 'Resources', section: 'workspace' },
  { to: '/profile', label: 'Profile', section: 'account' },
]

export default function AppShell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar items={NAV_ITEMS} />
      <div className="app-shell__body">
        <Sidebar items={NAV_ITEMS} />
        <main id="main-content" className="app-shell__main" tabIndex={-1}>
          <Container>
            <Outlet />
          </Container>
        </main>
      </div>
      <MobileNav items={NAV_ITEMS} />
    </div>
  )
}
