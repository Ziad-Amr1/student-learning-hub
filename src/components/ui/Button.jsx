import { cx } from '../../utils/cx'
import './Button.css'

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'destructive']
const SIZES = ['sm', 'md', 'lg']

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className,
  children,
  ...rest
}) {
  const variantClass = VARIANTS.includes(variant) ? `btn--${variant}` : 'btn--primary'
  const sizeClass = SIZES.includes(size) ? `btn--${size}` : 'btn--md'

  return (
    <button
      type={type}
      disabled={disabled}
      className={cx('btn', variantClass, sizeClass, className)}
      {...rest}
    >
      {children}
    </button>
  )
}
