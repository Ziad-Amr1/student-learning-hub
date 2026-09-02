import { useLearning } from '../../hooks/useLearning'
import { formatLearningUnits, normalizeLearningEntry } from '../../utils/learning'
import {
  LEARNING_CATEGORY_BADGE_VARIANT,
  LEARNING_CATEGORY_LABELS,
  LEARNING_STATUS_LABELS,
  LEARNING_STATUS_VISUALS,
} from '../../constants/learningStatus'
import Badge from '../../components/ui/Badge'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'

/**
 * Learning-progress section — Fed by the shared backend-backed learning store
 * (Phase D-3), live-synced with the Learning page. Renders every goal with
 * its status Badge; `completed` items switch their ProgressBar to the success
 * variant. Distinct from the Dashboard `LearningProgress` widget by
 * presentation (COMPONENTS.md), sharing the same data source.
 */
export default function LearningProgressList() {
  const { learning } = useLearning()
  const entries = learning ?? []
  const items = entries.map(normalizeLearningEntry)

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
              const units = formatLearningUnits(item)
              const statusVisual =
                LEARNING_STATUS_VISUALS[item.status] ?? LEARNING_STATUS_VISUALS['not-started']
              const isComplete = item.status === 'completed'
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 py-6 first:pt-0 last:pb-0"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h4>{item.title}</h4>
                      <Badge size="sm" variant={LEARNING_CATEGORY_BADGE_VARIANT}>
                        {LEARNING_CATEGORY_LABELS[item.category] ?? item.category}
                      </Badge>
                      <Badge size="sm" variant={statusVisual.badgeVariant}>
                        {LEARNING_STATUS_LABELS[item.status] ?? item.status}
                      </Badge>
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
                  {units && (
                    <p className="text-caption text-muted-foreground">{units}</p>
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