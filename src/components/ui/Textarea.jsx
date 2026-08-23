import { useId } from 'react'
import { cx } from '../../utils/cx'
import './form.css'

export default function Textarea({ label, error, className, id, rows = 4, ...rest }) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const errorId = `${textareaId}-error`

  return (
    <div className={cx('field', className)}>
      <label className="field__label text-label" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        className={cx('field__control', error && 'field__control--error')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
