import { cx } from '../../utils/cx'

const VARIANT_CLASSES = {
  primary: 'bg-primary border-transparent text-primary-foreground hover:not-disabled:bg-primary-hover',
  secondary:
    'bg-secondary border-transparent text-secondary-foreground hover:not-disabled:bg-secondary-hover',
  outline: 'bg-transparent border-input text-foreground hover:not-disabled:bg-surface-muted',
  ghost: 'bg-transparent border-transparent text-foreground hover:not-disabled:bg-surface-muted',
  destructive:
    'bg-destructive border-transparent text-destructive-foreground hover:not-disabled:bg-destructive-hover',
}

const SIZE_CLASSES = {
  sm: 'px-3 py-1 text-(--font-size-small)',
  md: 'px-4 py-2 text-(--font-size-body)',
  lg: 'px-6 py-3 text-(--font-size-body)',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md border font-medium cursor-pointer transition-[background-color,border-color,color] duration-150 ease-standard disabled:opacity-50 disabled:cursor-not-allowed active:not-disabled:brightness-[0.96]'

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
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md
  const nativeButtonProps = Component === 'button' ? { type, disabled } : {}

  return (
    <Component
      className={cx(BASE_CLASSES, variantClass, sizeClass, className)}
      {...nativeButtonProps}
      {...rest}
    >
      {children}
    </Component>
  )
}
