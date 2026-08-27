import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cx } from '../../utils/cx'

export default function Dialog({ open, onClose, title, description, children, className }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={cx(
        'backdrop:bg-scrim p-0 border-0 rounded-2xl shadow-lg max-w-lg w-full',
        'open:flex flex-col overflow-hidden',
        className
      )}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-0">
          <div className="space-y-1 min-w-0">
            <h3 className="font-bold text-foreground">{title}</h3>
            {description && (
              <p className="text-body-small text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="inline-flex items-center justify-center w-10 h-10 shrink-0 border-none rounded-md bg-transparent text-muted-foreground cursor-pointer hover:text-foreground hover:bg-surface-muted transition-colors"
          >
            <X aria-hidden="true" className="w-(--icon-md) h-(--icon-md)" />
          </button>
        </header>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </dialog>
  )
}
