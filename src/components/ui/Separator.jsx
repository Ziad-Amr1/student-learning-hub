import { cx } from '../../utils/cx'

export default function Separator({ orientation = 'horizontal', className, ...rest }) {
  const isVertical = orientation === 'vertical'
  return (
    <hr
      role="separator"
      aria-orientation={isVertical ? 'vertical' : undefined}
      className={cx(
        'm-0 shrink-0 bg-border border-none',
        isVertical ? 'w-px self-stretch' : 'w-full h-px',
        className
      )}
      {...rest}
    />
  )
}
