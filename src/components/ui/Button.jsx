import { cx } from '../../utils/cx'
import './Button.css'

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'destructive']
const SIZES = ['sm', 'md', 'lg']

export default function Button({
  as,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className,
  children,
  ...rest
}) {
  const Component = as || 'button'
  const variantClass = VARIANTS.includes(variant) ? `btn--${variant}` : 'btn--primary'
  const sizeClass = SIZES.includes(size) ? `btn--${size}` : 'btn--md'
  const nativeButtonProps = Component === 'button' ? { type, disabled } : {}

  return (
    <Component
      className={cx('btn', variantClass, sizeClass, className)}
      {...nativeButtonProps}
      {...rest}
    >
      {children}
    </Component>
  )
}
