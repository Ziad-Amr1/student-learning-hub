import { cx } from '../../utils/cx'
import './ProgressBar.css'

const VARIANTS = ['primary', 'success', 'warning', 'danger']

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
  const variantClass = VARIANTS.includes(variant) ? `progress__fill--${variant}` : 'progress__fill--primary'

  return (
    <div
      role="progressbar"
      className={cx('progress', className)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      aria-label={label}
    >
      <div className={cx('progress__fill', variantClass)} style={{ width: `${percent}%` }} />
    </div>
  )
}
