import { cx } from '../../utils/cx'
import Dialog from '../../components/ui/Dialog'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatDueDate } from '../../utils/date'
import { normalizeTaskStatus, TASK_STATUS_LABELS } from '../../utils/taskStatus'
import {
  PRIORITY_VARIANT,
  STATUS_ICON_BY_STATUS,
  STATUS_ICON_STYLE,
  STATUS_VISUALS,
} from '../../constants/cardStatus'

// Read-only "show me this task" view opened from the Dashboard recent-tasks
// list. Reuses the shared Dialog primitive; the only action is an explicit
// Edit that hands the task to the Tasks page edit flow (`?edit=`).
export default function TaskDetailsDialog({ task, onClose, onEdit }) {
  const status = normalizeTaskStatus(task.status)
  const StatusIcon = STATUS_ICON_BY_STATUS[status] ?? STATUS_ICON_BY_STATUS.unstarted
  const statusLabel = TASK_STATUS_LABELS[status] ?? status
  const statusVisual = STATUS_VISUALS[status] ?? STATUS_VISUALS.unstarted
  const due = formatDueDate(task.dueDate)

  return (
    <Dialog open onClose={onClose} title="Task details" description={task.title}>
      <div className="space-y-5">
        {task.description && (
          <div>
            <p className="mb-1 text-caption uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            <p className="text-body-small text-foreground whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" variant={statusVisual.badgeVariant}>
            <StatusIcon
              aria-hidden="true"
              className={cx('w-3 h-3 shrink-0', STATUS_ICON_STYLE[status])}
            />
            {statusLabel}
          </Badge>
          <Badge size="sm" variant={PRIORITY_VARIANT[task.priority] ?? 'outline'}>
            {task.priority}
          </Badge>
        </div>

        {due && (
          <div>
            <p className="mb-1 text-caption uppercase tracking-wide text-muted-foreground">
              Due date
            </p>
            <p className={cx('text-body-small', due.overdue && 'text-destructive-strong')}>
              {due.label}
              {task.dueDate ? ` · ${new Date(task.dueDate).toLocaleDateString()}` : ''}
            </p>
          </div>
        )}

        <div>
          <p className="mb-1 text-caption uppercase tracking-wide text-muted-foreground">
            Created
          </p>
          <p className="text-body-small">{new Date(task.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit}>Edit task</Button>
      </div>
    </Dialog>
  )
}