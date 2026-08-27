import Badge from '../../components/ui/Badge'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'

function formatHours(item) {
  if (item.targetHours == null) return null
  return `${item.completedHours ?? 0} of ${item.targetHours} hrs`
}

/**
 * Learning-progress section — renders the Sprint 03 progress seeds.
 * 100% items switch to the success variant + a Completed badge;
 * everything else uses the default primary progress bar.
 */
export default function LearningProgressList({ items }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning progress</CardTitle>
        <CardDescription>
          Courses, books, and topics you're currently tracking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-body-small text-muted-foreground">
            No learning progress tracked yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const hours = formatHours(item)
              const isComplete = item.progress >= 100
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 py-6 first:pt-0 last:pb-0"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h4>{item.title}</h4>
                      <Badge variant="secondary">{item.category}</Badge>
                      {isComplete && <Badge variant="success">Completed</Badge>}
                    </div>
                    <span className="shrink-0 text-label text-primary-strong">
                      {item.progress}%
                    </span>
                  </div>
                  <ProgressBar
                    value={item.progress}
                    label={`${item.title} progress`}
                    variant={isComplete ? 'success' : 'primary'}
                  />
                  {hours && (
                    <p className="text-caption text-muted-foreground">{hours}</p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
