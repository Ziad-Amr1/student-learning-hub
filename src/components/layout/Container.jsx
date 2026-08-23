import { cx } from '../../utils/cx'
import './Container.css'

export default function Container({ as = 'div', className, children, ...rest }) {
  const Tag = as
  return (
    <Tag className={cx('container', className)} {...rest}>
      {children}
    </Tag>
  )
}
