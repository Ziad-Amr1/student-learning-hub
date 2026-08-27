import { Trash2 } from 'lucide-react'
import { cx } from '../../utils/cx'
import { formatDueDate } from '../../utils/date'
import { FIELD_CONTROL_CLASSES } from '../../components/ui/formStyles'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

const PRIORITY_VARIANT = {
  low: 'outline',
  medium: 'info',
  high: 'danger',
}

const STATUS_VARIANT = {
  todo: 'secondary',
  'in-progress': 'warning',
  done: 'success',
}

export default function TaskCard({ task, onEdit, onUpdateStatus, onDelete }) {
  const due = formatDueDate(task.dueDate)

  return (
    <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-foreground truncate">{task.title}</h3>
          <Badge variant={PRIORITY_VARIANT[task.priority] ?? 'outline'}>{task.priority}</Badge>
          <Badge variant={STATUS_VARIANT[task.status] ?? 'secondary'}>{task.status}</Badge>
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
        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value)}
          className={cx(FIELD_CONTROL_CLASSES, 'w-auto text-sm cursor-pointer')}
          aria-label={`Status for "${task.title}"`}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <Button variant="secondary" size="sm" onClick={() => onEdit(task)}>
          Edit
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
