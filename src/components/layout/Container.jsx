import { cx } from '../../utils/cx'

export default function Container({ as = 'div', className, children, ...rest }) {
  const Tag = as
  return (
    <Tag
      className={cx(
        'w-full max-w-(--layout-container-max) mx-auto px-4 md:px-6 lg:px-8',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
