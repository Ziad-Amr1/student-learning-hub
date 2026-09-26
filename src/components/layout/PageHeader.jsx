import { cx } from '../../utils/cx'

export default function PageHeader({ title, description, className }) {
  return (
    <header className={cx('flex flex-col gap-2', className)}>
      <h1>{title}</h1>
      {description && (
        <p className="text-body-small text-muted-foreground max-w-[60ch]">{description}</p>
      )}
    </header>
  )
}
