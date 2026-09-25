import { cx } from '../../utils/cx'
import Button from './Button'

export default function ErrorBanner({ message, onRetry, className }) {
  return (
    <div
      role="alert"
      className={cx(
        'flex flex-col gap-3 rounded-lg border border-destructive-soft bg-destructive-soft/20 p-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <p className="text-body-small text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}