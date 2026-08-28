import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import useLocalStorage from '../../hooks/useLocalStorage'
import { LEARNING_ENTRIES } from '../../data/learning'
import {
  formatLearningUnits,
  normalizeLearningEntry,
  sortLearningByUpdatedAt,
} from '../../utils/learning'

const PREVIEW_COUNT = 5

// Fed by the shared `student-hub:learning` store (Sprint 07.6) — live-syncs
// with anything the Learning page edits, exactly like Dashboard↔Tasks in 07.5.
export default function LearningProgress({ className }) {
  const [entries] = useLocalStorage('student-hub:learning', () => [...LEARNING_ENTRIES])
  const items = sortLearningByUpdatedAt(entries.map(normalizeLearningEntry)).slice(0, PREVIEW_COUNT)

  return (
    <Card className={className} aria-label="Learning progress">
      <CardHeader>
        <CardTitle>Learning progress</CardTitle>
        <CardDescription>How far along your courses and reading are.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {items.length === 0 ? (
          <p className="text-body-small text-muted-foreground">
            No learning goals yet — add your first one on the Learning page.
          </p>
        ) : (
          items.map((item) => {
            const units = formatLearningUnits(item)
            return (
              <div key={item.id} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-medium text-body-small">{item.title}</p>
                  <p className="text-caption text-muted-foreground">{item.category}</p>
                </div>
                <ProgressBar value={item.progress} label={`${item.title}: ${item.progress}% complete`} />
                {units && <p className="text-body-small text-muted-foreground">{units}</p>}
              </div>
            )
          })
        )}
      </CardContent>
      {items.length > 0 && (
        <CardFooter className="justify-end">
          <Button as={Link} to="/learning" variant="ghost" size="sm">
            View all learning
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}