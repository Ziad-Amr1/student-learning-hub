import { cx } from '../../utils/cx'
import './Separator.css'

export default function Separator({ orientation = 'horizontal', className, ...rest }) {
  const isVertical = orientation === 'vertical'
  return (
    <hr
      role="separator"
      aria-orientation={isVertical ? 'vertical' : undefined}
      className={cx('separator', isVertical ? 'separator--vertical' : 'separator--horizontal', className)}
      {...rest}
    />
  )
}
