import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  CircleUser,
  LayoutDashboard,
  Library,
  ListTodo,
  NotebookPen,
} from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import NavigationDrawer from './NavigationDrawer'
import Container from './Container'
import './AppShell.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', section: 'workspace', Icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', section: 'workspace', Icon: ListTodo },
  { to: '/notes', label: 'Notes', section: 'workspace', Icon: NotebookPen },
  { to: '/resources', label: 'Resources', section: 'workspace', Icon: Library },
  { to: '/profile', label: 'Profile', section: 'account', Icon: CircleUser },
]

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar items={NAV_ITEMS} onMenuClick={() => setMenuOpen(true)} />
      <Sidebar items={NAV_ITEMS} />
      <main id="main-content" className="app-shell__main" tabIndex={-1}>
        <Container>
          <Outlet />
        </Container>
      </main>
      <MobileNav items={NAV_ITEMS} />
      <NavigationDrawer
        items={NAV_ITEMS}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </div>
  )
}
