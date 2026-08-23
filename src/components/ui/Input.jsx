import { useId } from 'react'
import { cx } from '../../utils/cx'
import {
  FIELD_CLASSES,
  FIELD_CONTROL_CLASSES,
  FIELD_CONTROL_ERROR_CLASSES,
  FIELD_ERROR_CLASSES,
} from './formStyles'

export default function Input({ label, error, className, id, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className={cx(FIELD_CLASSES, className)}>
      <label className="text-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={cx(FIELD_CONTROL_CLASSES, error && FIELD_CONTROL_ERROR_CLASSES)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <p className={FIELD_ERROR_CLASSES} id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
