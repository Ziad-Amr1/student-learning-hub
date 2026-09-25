import { Pencil, Trash2 } from 'lucide-react'
import { cx } from '../../utils/cx'
import { formatDueDate } from '../../utils/date'
import {
  normalizeTaskStatus,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '../../utils/taskStatus'
import {
  PRIORITY_VARIANT,
  STATUS_ICON_BY_STATUS,
  STATUS_ICON_STYLE,
  STATUS_VISUALS,
} from '../../constants/cardStatus'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/Tooltip'

const STATUS_OPTIONS = TASK_STATUSES.map((value) => ({
  value,
  label: TASK_STATUS_LABELS[value],
  Icon: STATUS_ICON_BY_STATUS[value],
}))

// Status is chosen via the shared shadcn-style Select; actions are icon-only
// ghost buttons whose accessible names stay on aria-label, with a Tooltip as
// a supplementary hover affordance.
export default function TaskCard({ task, onEdit, onUpdateStatus, onDelete }) {
  const status = normalizeTaskStatus(task.status)
  const StatusIcon = STATUS_ICON_BY_STATUS[status] ?? STATUS_ICON_BY_STATUS.unstarted
  const statusLabel = TASK_STATUS_LABELS[status] ?? status
  const statusVisual = STATUS_VISUALS[status] ?? STATUS_VISUALS.unstarted
  const due = formatDueDate(task.dueDate)

  return (
    <Card
      className={cx(
        'group p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
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
        <Select value={status} onValueChange={(newStatus) => onUpdateStatus(task.id, newStatus)}>
          <SelectTrigger
            aria-label={`Status for "${task.title}"`}
            className="px-2.5 py-1.5 text-sm hover:bg-surface-muted"
          >
            <SelectValue>
              <span className="flex min-w-0 items-center gap-1.5">
                <StatusIcon
                  aria-hidden="true"
                  className={cx('w-(--icon-sm) h-(--icon-sm) shrink-0', STATUS_ICON_STYLE[status])}
                />
                <span className="truncate text-sm font-medium">{statusLabel}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => {
              const OptionIcon = option.Icon
              return (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-1.5">
                    <OptionIcon
                      aria-hidden="true"
                      className={cx('w-(--icon-sm) h-(--icon-sm) shrink-0', STATUS_ICON_STYLE[option.value])}
                    />
                    <span>{option.label}</span>
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <span className="flex items-center gap-2 transition-opacity duration-150 ease-standard pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                aria-label={`Edit task: ${task.title}`}
                className="focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring-soft)]"
              >
                <Pencil className="w-(--icon-sm) h-(--icon-sm)" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                aria-label={`Delete task: ${task.title}`}
                className="focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring-soft)]"
              >
                <Trash2 className="w-(--icon-sm) h-(--icon-sm)" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </span>
      </div>
    </Card>
  )
}