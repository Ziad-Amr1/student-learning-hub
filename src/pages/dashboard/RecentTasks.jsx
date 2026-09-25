import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cx } from '../../utils/cx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useTasks } from '../../hooks/useTasks'
import TaskDetailsDialog from './TaskDetailsDialog'

const RECENT_COUNT = 5

const PRIORITY_BADGE_VARIANTS = {
  high: 'danger',
  medium: 'info',
  low: 'outline',
}

export default function RecentTasks({ className }) {
  const { tasks } = useTasks()
  const navigate = useNavigate()
  const [detailsTask, setDetailsTask] = useState(null)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, RECENT_COUNT)

  return (
    <Card className={className} aria-label="Recent tasks">
      <CardHeader>
        <CardTitle>Recent tasks</CardTitle>
        <CardDescription>Your latest five tasks, newest first.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentTasks.length === 0 ? (
          <p className="text-body-small text-muted-foreground">
            No tasks yet — add your first one on the Tasks page.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recentTasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => setDetailsTask(task)}
                  aria-label={`View details for "${task.title}"`}
                  className={cx(
                    '-mx-2 flex w-full items-center justify-between gap-3 rounded-md px-2 py-3 text-left cursor-pointer transition-colors',
                    'hover:bg-surface-muted',
                    'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring-soft)]'
                  )}
                >
                  <span
                    className={cx(
                      'min-w-0 flex-1 truncate text-body-small font-medium',
                      task.status === 'done' && 'text-muted-foreground line-through'
                    )}
                  >
                    {task.title}
                  </span>
                  <Badge variant={PRIORITY_BADGE_VARIANTS[task.priority] ?? 'outline'}>
                    {task.priority}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {detailsTask && (
        <TaskDetailsDialog
          task={detailsTask}
          onClose={() => setDetailsTask(null)}
          onEdit={() => {
            setDetailsTask(null)
            navigate(`/tasks?edit=${detailsTask.id}`)
          }}
        />
      )}
    </Card>
  )
}