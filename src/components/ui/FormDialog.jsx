import Dialog from './Dialog'
import Button from './Button'

export default function FormDialog({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel = 'Save',
  children,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary">
            {submitLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
