import { Pencil, Trash2 } from 'lucide-react'
import { cx } from '../../utils/cx'
import { formatDueDate } from '../../utils/date'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import StatusDropdown from '../../components/ui/StatusDropdown'

const PRIORITY_VARIANT = {
  low: 'outline',
  medium: 'info',
  high: 'danger',
}

const STATUS_VARIANT = {
  todo: 'secondary',
  'in-progress': 'warning',
  deferred: 'info',
  done: 'success',
  cancelled: 'danger',
}

const STATUS_BORDER_CLASS = {
  todo: 'border-l-muted/40',
  'in-progress': 'border-l-warning',
  deferred: 'border-l-info',
  done: 'border-l-success',
  cancelled: 'border-l-destructive',
}

const STATUS_BG_CLASS = {
  todo: '',
  'in-progress': '!bg-warning-soft/20',
  deferred: '!bg-info-soft/20',
  done: '!bg-success-soft/20',
  cancelled: '!bg-destructive-soft/20',
}

export default function TaskCard({ task, onEdit, onUpdateStatus, onDelete }) {
  const due = formatDueDate(task.dueDate)

  return (
    <Card
      className={cx(
        'p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
        'border-l-2 transition-[border-color,background-color]',
        STATUS_BORDER_CLASS[task.status] ?? '',
        STATUS_BG_CLASS[task.status] ?? ''
      )}
    >
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-foreground truncate">{task.title}</h3>
          <Badge variant={PRIORITY_VARIANT[task.priority] ?? 'outline'}>{task.priority}</Badge>
          <Badge variant={STATUS_VARIANT[task.status] ?? 'secondary'}>
            {task.status}
          </Badge>
        </div>
        {task.description && (
          <p className="text-body-small text-muted-foreground">{task.description}</p>
        )}
        {due && (
          <span className={`text-caption block pt-1 ${due.overdue ? 'text-destructive-strong' : 'text-muted-foreground'}`}>
            {due.label}
          </span>
        )}
        <span className="text-caption text-muted-foreground block pt-1">
          Created {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-0 border-border">
        <StatusDropdown
          value={task.status}
          onChange={(newStatus) => onUpdateStatus(task.id, newStatus)}
          taskTitle={task.title}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(task)}
          aria-label={`Edit task: ${task.title}`}
        >
          <Pencil className="w-(--icon-sm) h-(--icon-sm)" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task: ${task.title}`}
        >
          <Trash2 className="w-(--icon-sm) h-(--icon-sm)" />
        </Button>
      </div>
    </Card>
  )
}
