import { useId } from 'react'
import { cx } from '../../utils/cx'
import {
  FIELD_CLASSES,
  FIELD_CONTROL_CLASSES,
  FIELD_CONTROL_ERROR_CLASSES,
  FIELD_ERROR_CLASSES,
} from './formStyles'

export default function Textarea({ label, error, className, id, rows = 4, ...rest }) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const errorId = `${textareaId}-error`

  return (
    <div className={cx(FIELD_CLASSES, className)}>
      <label className="text-label" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
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
