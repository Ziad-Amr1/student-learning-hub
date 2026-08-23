import { cx } from '../../utils/cx'
import './Badge.css'

const VARIANTS = ['default', 'secondary', 'success', 'warning', 'danger', 'info', 'outline']

export default function Badge({ variant = 'default', className, children, ...rest }) {
  const variantClass = VARIANTS.includes(variant) ? `badge--${variant}` : 'badge--default'

  return (
    <span className={cx('badge', variantClass, className)} {...rest}>
      {children}
    </span>
  )
}
