import { cx } from '../../utils/cx'

export default function ModuleToolbar({ children, className }) {
  return (
    <div
      className={cx(
        'sticky top-(--layout-navbar-height) z-(--z-toolbar)',
        'bg-background/95 backdrop-blur-sm',
        'border-b border-border',
        'py-3',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  )
}
