import { NavLink } from 'react-router-dom'
import { cx } from '../../utils/cx'

const LINK_CLASSES =
  'relative flex-1 flex items-center justify-center min-h-(--layout-mobilenav-height) rounded-md no-underline hover:bg-surface-muted'
const ACTIVE_BAR_CLASSES =
  "before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-6 before:h-[3px] before:rounded-full"

export default function MobileNav({ items }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-(--z-nav) min-h-(--layout-mobilenav-height) bg-surface border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Primary"
    >
      <ul className="flex">
        {items.map((item) => (
          <li key={item.to} className="flex flex-1">
            <NavLink
              to={item.to}
              aria-label={item.label}
              title={item.label}
              className={({ isActive }) =>
                cx(
                  LINK_CLASSES,
                  ACTIVE_BAR_CLASSES,
                  isActive
                    ? 'text-primary-strong before:bg-primary-strong'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <item.Icon aria-hidden="true" className="w-(--icon-lg) h-(--icon-lg)" />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
