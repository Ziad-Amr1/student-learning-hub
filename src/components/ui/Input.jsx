import { useId } from 'react'
import { cx } from '../../utils/cx'
import {
  FIELD_CLASSES,
  FIELD_CONTROL_CLASSES,
  FIELD_CONTROL_ERROR_CLASSES,
  FIELD_ERROR_CLASSES,
  FIELD_REQUIRED_CLASSES,
} from './formStyles'

// `required` does double duty: it forwards the native attribute to the control
// (so assistive tech announces the requirement) AND renders the visible
// asterisk next to the label. The form is submitted with `noValidate`, so the
// browser never blocks submission on it — validation stays owned by the
// application's field-level rules.
export default function Input({ label, error, className, id, required, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className={cx(FIELD_CLASSES, className)}>
      <label className="text-label" htmlFor={inputId}>
        {label}
        {required ? (
          <span className={FIELD_REQUIRED_CLASSES} aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      <input
        id={inputId}
        required={required}
        className={cx(FIELD_CONTROL_CLASSES, error && FIELD_CONTROL_ERROR_CLASSES)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <p className={FIELD_ERROR_CLASSES} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
