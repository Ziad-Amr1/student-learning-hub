import { cx } from '../../utils/cx'
import './Avatar.css'

const SIZES = ['sm', 'md', 'lg']

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).slice(0, 2)
  return words.map((word) => word[0].toUpperCase()).join('')
}

export default function Avatar({ src, name, size = 'md', className }) {
  const sizeClass = SIZES.includes(size) ? `avatar--${size}` : 'avatar--md'

  return (
    <span className={cx('avatar', sizeClass, className)} title={name}>
      {src ? (
        <img className="avatar__image" src={src} alt={name ?? ''} />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}
