import { cx } from '../../utils/cx'

const VARIANT_CLASSES = {
  default: 'bg-primary-soft border-transparent text-primary-strong',
  secondary: 'bg-secondary border-transparent text-secondary-strong',
  accent: 'bg-accent-soft border-transparent text-accent-strong',
  success: 'bg-success-soft border-transparent text-success-strong',
  warning: 'bg-warning-soft border-transparent text-warning-strong',
  danger: 'bg-destructive-soft border-transparent text-destructive-strong',
  info: 'bg-info-soft border-transparent text-info-strong',
  outline: 'bg-transparent border-input text-muted-foreground',
}

const BASE_CLASSES =
  'inline-flex items-center gap-1 w-fit px-3 py-[calc(var(--space-1)/2)] rounded-full border text-(--font-size-caption) leading-small font-semibold'

export default function Badge({ variant = 'default', className, children, ...rest }) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default

  return (
    <span className={cx(BASE_CLASSES, variantClass, className)} {...rest}>
      {children}
    </span>
  )
}
