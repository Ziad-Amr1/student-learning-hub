import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen,
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
  { to: '/learning', label: 'Learning', section: 'workspace', Icon: BookOpen },
  { to: '/profile', label: 'Profile', section: 'account', Icon: CircleUser },
]

const SIDEBAR_KEY = 'student-hub:sidebar-collapsed'

function readSidebarPreference() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  } catch {
    return false
  }
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarPreference)
  const mainRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next))
      } catch { /* ignore */ }
      return next
    })
  }

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
        onToggle={handleSidebarToggle}
      />
      <main
        ref={mainRef}
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
