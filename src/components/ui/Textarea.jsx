import { useId } from 'react'
import { cx } from '../../utils/cx'
import {
  FIELD_CLASSES,
  FIELD_CONTROL_CLASSES,
  FIELD_CONTROL_ERROR_CLASSES,
  FIELD_ERROR_CLASSES,
  FIELD_REQUIRED_CLASSES,
} from './formStyles'

// Mirrors Input: `required` forwards the native attribute and renders the
// visible asterisk (see Input.jsx for why the marker is not the only signal).
export default function Textarea({ label, error, className, id, rows = 4, required, ...rest }) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const errorId = `${textareaId}-error`

  return (
    <div className={cx(FIELD_CLASSES, className)}>
      <label className="text-label" htmlFor={textareaId}>
        {label}
        {required ? (
          <span className={FIELD_REQUIRED_CLASSES} aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
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
