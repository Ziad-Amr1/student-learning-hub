import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  CircleUser,
  LayoutDashboard,
  Library,
  ListTodo,
  NotebookPen,
} from 'lucide-react'
import { cx } from '../../utils/cx'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import NavigationDrawer from './NavigationDrawer'
import Container from './Container'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', section: 'workspace', Icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', section: 'workspace', Icon: ListTodo },
  { to: '/notes', label: 'Notes', section: 'workspace', Icon: NotebookPen },
  { to: '/resources', label: 'Resources', section: 'workspace', Icon: Library },
  { to: '/profile', label: 'Profile', section: 'account', Icon: CircleUser },
]

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div
      className={cx(
        'min-h-screen grid grid-cols-1 grid-rows-[var(--layout-navbar-height)_1fr]',
        "[grid-template-areas:'navbar'_'main']",
        'lg:grid-cols-[var(--layout-sidebar-width)_1fr]',
        "lg:[grid-template-areas:'sidebar_navbar'_'sidebar_main']",
        'lg:[transition:grid-template-columns_150ms_var(--ease-standard)]',
        sidebarCollapsed && 'lg:grid-cols-[var(--layout-sidebar-width-collapsed)_1fr]'
      )}
    >
      <a
        className="absolute -top-full left-2 z-(--z-skip-link) py-2 px-4 bg-primary text-primary-foreground rounded-md no-underline font-medium focus:top-2"
        href="#main-content"
      >
        Skip to content
      </a>
      <Navbar items={NAV_ITEMS} onMenuClick={() => setMenuOpen(true)} />
      <Sidebar
        items={NAV_ITEMS}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        id="main-content"
        className="[grid-area:main] outline-none pt-6 md:pt-8 pb-[calc(var(--layout-mobilenav-height)+env(safe-area-inset-bottom,0px)+var(--space-4))] lg:pb-(--layout-section-gap)"
        tabIndex={-1}
      >
        {/* mx-0! anchors the page container to the main track's inline start at lg,
            and max-w-none! releases the 72rem reading cap there - both so
            sidebar-collapse width flows into CONTENT position instead of pooling
            as dead gutter. Below lg, and on public pages, Container keeps its
            centered max width. */} 
        <Container className="lg:mx-0! lg:max-w-none!">
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
