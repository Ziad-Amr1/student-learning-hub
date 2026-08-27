import { Pencil, Trash2 } from 'lucide-react'
import { cx } from '../../utils/cx'
import { formatDueDate } from '../../utils/date'
import {
  normalizeTaskStatus,
  TASK_STATUS_LABELS,
} from '../../utils/taskStatus'
import {
  PRIORITY_VARIANT,
  STATUS_VISUALS,
} from '../../constants/cardStatus'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import StatusDropdown from '../../components/ui/StatusDropdown'

export default function TaskCard({ task, onEdit, onUpdateStatus, onDelete }) {
  const status = normalizeTaskStatus(task.status)
  const statusVisual = STATUS_VISUALS[status] ?? STATUS_VISUALS.unstarted
  const due = formatDueDate(task.dueDate)

  return (
    <Card
      className={cx(
        'p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
        'border-l-2 transition-[border-color,background-color]',
        statusVisual.borderClass,
        statusVisual.bgClass
      )}
    >
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-foreground truncate">{task.title}</h3>
          <Badge variant={PRIORITY_VARIANT[task.priority] ?? 'outline'}>{task.priority}</Badge>
          <Badge variant={statusVisual.badgeVariant}>
            {TASK_STATUS_LABELS[status] ?? status}
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
          value={status}
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
