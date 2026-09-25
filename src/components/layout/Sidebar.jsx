import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cx } from '../../utils/cx'
import Separator from '../ui/Separator'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip'

const SECTIONS = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'account', label: 'Account' },
]

const LINK_CLASSES =
  "relative flex items-center gap-3 p-2 rounded-md no-underline whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-4 before:rounded-full"
const ACTIVE_LINK_CLASSES =
  'text-primary-strong bg-primary-soft font-semibold before:bg-primary-strong'
const INACTIVE_LINK_CLASSES = 'font-medium text-muted-foreground hover:text-foreground hover:bg-surface-muted'

export default function Sidebar({ items, collapsed = false, onToggle }) {
  return (
    <aside
      className={cx(
        '[grid-area:sidebar] hidden lg:flex flex-col sticky top-0 h-screen',
        'w-(--layout-sidebar-width) pt-6 px-3 pb-4 bg-surface border-r border-border',
        'overflow-y-auto overflow-x-hidden',
        'lg:[transition:width_150ms_var(--ease-standard)]',
        collapsed && 'w-(--layout-sidebar-width-collapsed)'
      )}
    >
      <nav className="flex-1" aria-label="Primary">
        {SECTIONS.map((section, index) => {
          const sectionItems = items.filter((item) => item.section === section.id)
          return (
            <div key={section.id}>
              {index > 0 && <Separator className="my-4" />}
              <p
                className={cx(
                  'm-0 mb-2 px-2 text-muted-foreground text-(--font-size-caption) font-normal uppercase whitespace-nowrap',
                  collapsed && 'hidden'
                )}
              >
                {section.label}
              </p>
              <ul className={cx(collapsed && 'space-y-2')}>
                {sectionItems.map((item) => {
                  const link = (
                    <NavLink
                      to={item.to}
                      aria-label={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cx(
                          LINK_CLASSES,
                          isActive ? ACTIVE_LINK_CLASSES : INACTIVE_LINK_CLASSES,
                          collapsed && 'justify-center'
                        )
                      }
                    >
                      <item.Icon
                        aria-hidden="true"
                        className="w-(--icon-md) h-(--icon-md) shrink-0"
                      />
                      <span className={cx(collapsed && 'hidden')}>{item.label}</span>
                    </NavLink>
                  )
                  return (
                    <li key={item.to}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block">{link}</span>
                          </TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Expand sidebar"
              onClick={onToggle}
              className={cx(
                'flex items-center gap-3 w-full min-h-10 p-2 border-none rounded-md bg-transparent text-muted-foreground text-(--font-size-small) font-medium text-left whitespace-nowrap cursor-pointer hover:text-foreground hover:bg-surface-muted',
                collapsed && 'justify-center'
              )}
            >
              <PanelLeftOpen aria-hidden="true" className="w-(--icon-md) h-(--icon-md) shrink-0" />
              <span className="hidden">Collapse</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Expand sidebar</TooltipContent>
        </Tooltip>
      ) : (
        <button
          type="button"
          aria-label="Collapse sidebar"
          onClick={onToggle}
          className="flex items-center gap-3 w-full min-h-10 p-2 border-none rounded-md bg-transparent text-muted-foreground text-(--font-size-small) font-medium text-left whitespace-nowrap cursor-pointer hover:text-foreground hover:bg-surface-muted"
        >
          <PanelLeftClose aria-hidden="true" className="w-(--icon-md) h-(--icon-md) shrink-0" />
          <span>Collapse</span>
        </button>
      )}
    </aside>
  )
}
