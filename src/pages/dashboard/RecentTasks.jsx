import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { TASKS } from '../../data/tasks'

const RECENT_COUNT = 5

const PRIORITY_BADGE_VARIANTS = {
  high: 'danger',
  medium: 'info',
  low: 'outline',
}

export default function RecentTasks({ className }) {
  const recentTasks = [...TASKS]
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
              <li key={task.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 truncate text-body-small font-medium">
                  {task.title}
                </span>
                <Badge variant={PRIORITY_BADGE_VARIANTS[task.priority] ?? 'outline'}>
                  {task.priority}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
