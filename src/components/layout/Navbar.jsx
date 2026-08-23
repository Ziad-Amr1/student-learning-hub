import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'

export default function Navbar({ items, onMenuClick }) {
  return (
    <header className="[grid-area:navbar] sticky top-0 z-(--z-nav) h-(--layout-navbar-height) bg-surface border-b border-border">
      <div className="h-full px-4 md:px-6 lg:px-8 flex items-center justify-between gap-2">
        <NavLink
          to="/dashboard"
          className="text-(--font-size-h4) font-bold text-foreground no-underline"
        >
          Huby<span className="text-primary">.</span>
        </NavLink>
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="inline-flex items-center justify-center w-10 h-10 -mr-2 border-none rounded-md bg-transparent text-foreground cursor-pointer hover:bg-surface-muted lg:hidden"
        >
          <Menu aria-hidden="true" className="w-(--icon-lg) h-(--icon-lg)" />
        </button>
      </div>
    </header>
  )
}
