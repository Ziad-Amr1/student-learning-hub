import { useId } from 'react'
import { cx } from '../../utils/cx'
import './form.css'

export default function Input({ label, error, className, id, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className={cx('field', className)}>
      <label className="field__label text-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
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
