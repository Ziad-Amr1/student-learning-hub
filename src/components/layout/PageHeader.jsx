import { cx } from '../../utils/cx'
import './PageHeader.css'

export default function PageHeader({ title, description, actions, className }) {
  return (
    <header className={cx('page-header', className)}>
      <div className="page-header__row">
        <h1>{title}</h1>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
      {description && <p className="page-header__description text-body-small">{description}</p>}
    </header>
  )
}
