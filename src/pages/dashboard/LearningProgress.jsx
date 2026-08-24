import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import { LEARNING_PROGRESS } from '../../data/progress'

export default function LearningProgress({ className }) {
  return (
    <Card className={className} aria-label="Learning progress">
      <CardHeader>
        <CardTitle>Learning progress</CardTitle>
        <CardDescription>How far along your courses and reading are.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {LEARNING_PROGRESS.map((item) => (
          <div key={item.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="font-medium text-body-small">{item.title}</p>
              <p className="text-caption text-muted-foreground">{item.category}</p>
            </div>
            <ProgressBar value={item.progress} label={`${item.title}: ${item.progress}% complete`} />
            {typeof item.completedHours === 'number' && typeof item.targetHours === 'number' && (
              <p className="text-body-small text-muted-foreground">
                {item.completedHours} of {item.targetHours} hours
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
