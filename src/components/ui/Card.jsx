import { cx } from '../../utils/cx'
import './Card.css'

export function Card({ className, children, ...rest }) {
  return (
    <section className={cx('card', className)} {...rest}>
      {children}
    </section>
  )
}

export function CardHeader({ className, children }) {
  return <div className={cx('card__header', className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return <h3 className={cx('card__title', className)}>{children}</h3>
}

export function CardDescription({ className, children }) {
  return <p className={cx('card__description', className)}>{children}</p>
}

export function CardContent({ className, children }) {
  return <div className={cx('card__content', className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return <div className={cx('card__footer', className)}>{children}</div>
}

export default Card
