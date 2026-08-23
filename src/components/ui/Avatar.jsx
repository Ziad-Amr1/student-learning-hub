import { cx } from '../../utils/cx'

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-(--font-size-caption)',
  md: 'w-10 h-10 text-(--font-size-small)',
  lg: 'w-12 h-12 text-(--font-size-h4)',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-primary-soft text-primary-strong font-semibold'

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).slice(0, 2)
  return words.map((word) => word[0].toUpperCase()).join('')
}

export default function Avatar({ src, name, size = 'md', className }) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  return (
    <span className={cx(BASE_CLASSES, sizeClass, className)} title={name}>
      {src ? (
        <img className="w-full h-full object-cover" src={src} alt={name ?? ''} />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}
