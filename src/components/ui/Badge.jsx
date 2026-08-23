import { cx } from '../../utils/cx'

const VARIANT_CLASSES = {
  default: 'bg-primary-soft text-primary-strong',
  secondary: 'bg-secondary text-secondary-strong',
  success: 'bg-success-soft text-success-strong',
  warning: 'bg-warning-soft text-warning-strong',
  danger: 'bg-destructive-soft text-destructive-strong',
  info: 'bg-info-soft text-info-strong',
  outline: 'bg-transparent border-input text-muted-foreground',
}

const BASE_CLASSES =
  'inline-flex items-center gap-1 w-fit px-3 py-[calc(var(--space-1)/2)] rounded-full border border-transparent text-(--font-size-caption) leading-small font-semibold'

export default function Badge({ variant = 'default', className, children, ...rest }) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default

  return (
    <span className={cx(BASE_CLASSES, variantClass, className)} {...rest}>
      {children}
    </span>
  )
}
