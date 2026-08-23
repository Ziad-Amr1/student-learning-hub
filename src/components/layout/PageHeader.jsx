import { cx } from '../../utils/cx'

export default function PageHeader({ title, description, actions, className }) {
  return (
    <header className={cx('flex flex-col gap-2 mb-(--layout-section-gap)', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1>{title}</h1>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
      {description && (
        <p className="text-body-small text-muted-foreground max-w-[60ch]">{description}</p>
      )}
    </header>
  )
}
