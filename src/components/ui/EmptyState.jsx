import { cx } from '../../utils/cx'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...rest
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center gap-2 text-center',
        'bg-surface border border-border rounded-lg py-12 px-4',
        className
      )}
      {...rest}
    >
      {Icon && (
        <span
          className="mb-1 inline-flex items-center justify-center rounded-full bg-primary-soft p-3"
          aria-hidden="true"
        >
          <Icon className="w-(--icon-lg) h-(--icon-lg) text-primary-strong" />
        </span>
      )}
      <p className="m-0 font-semibold text-foreground">{title}</p>
      {description && <p className="m-0 text-body-small text-muted-foreground">{description}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}