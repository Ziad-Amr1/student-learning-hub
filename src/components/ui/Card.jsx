import { cx } from '../../utils/cx'

const CARD_CLASSES = 'flex flex-col gap-4 bg-surface border border-border rounded-lg shadow-sm p-6'

export function Card({ className, children, ...rest }) {
  return (
    <section className={cx(CARD_CLASSES, className)} {...rest}>
      {children}
    </section>
  )
}

export function CardHeader({ className, children }) {
  return <div className={cx('flex flex-col gap-1', className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return <h3 className={cx('text-(--font-size-h4)', className)}>{children}</h3>
}

export function CardDescription({ className, children }) {
  return <p className={cx('text-muted-foreground text-body-small', className)}>{children}</p>
}

export function CardContent({ className, children }) {
  return <div className={cx(className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return (
    <div className={cx('mt-auto pt-4 flex items-center gap-3 border-t border-border', className)}>
      {children}
    </div>
  )
}

export default Card
