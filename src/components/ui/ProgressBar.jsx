import { cx } from '../../utils/cx'

const VARIANT_CLASSES = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
}

const FILL_CLASSES = 'h-full rounded-full transition-[width] duration-200 ease-standard'

function clamp(value, max) {
  return Math.min(Math.max(value, 0), max)
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  variant = 'primary',
  className,
}) {
  const safeValue = clamp(Number(value) || 0, max)
  const percent = (safeValue / max) * 100
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary

  return (
    <div
      role="progressbar"
      className={cx('w-full h-2 overflow-hidden rounded-full bg-surface-muted', className)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      aria-label={label}
    >
      <div className={cx(FILL_CLASSES, variantClass)} style={{ width: `${percent}%` }} />
    </div>
  )
}
