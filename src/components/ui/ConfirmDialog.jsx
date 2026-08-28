import Dialog from './Dialog'
import Button from './Button'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      {message && (
        <p className="text-body-small text-muted-foreground leading-relaxed mb-5">
          {message}
        </p>
      )}
      <div className="flex justify-end items-center gap-3">
        <Button variant="secondary" size="sm" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="destructive" size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
