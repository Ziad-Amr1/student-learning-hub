import { Pencil, Trash2 } from 'lucide-react'
import { cx } from '../../utils/cx'
import {
  LEARNING_CATEGORY_BADGE_VARIANT,
  LEARNING_CATEGORY_LABELS,
  LEARNING_STATUS_LABELS,
  LEARNING_STATUS_VISUALS,
} from '../../constants/learningStatus'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import LinkedItems from './LinkedItems'

export default function LearningEntryCard({
  entry,
  linkedNotes = [],
  linkedResources = [],
  onEdit,
  onDelete,
}) {
  const statusVisual = LEARNING_STATUS_VISUALS[entry.status] ?? LEARNING_STATUS_VISUALS['not-started']
  const isCompleted = entry.status === 'completed'
  const notesLabel = entry.category === 'book' ? 'Chapters' : 'Notes'
  const hours =
    typeof entry.targetHours === 'number'
      ? `${entry.completedHours ?? 0} of ${entry.targetHours} hrs`
      : null

  return (
    <Card
      className={cx(
        'p-4 flex flex-col gap-3',
        'border-l-2 transition-[border-color,background-color]',
        statusVisual.borderClass,
        statusVisual.bgClass
      )}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-foreground">{entry.title}</h3>
          <Badge variant={LEARNING_CATEGORY_BADGE_VARIANT}>
            {LEARNING_CATEGORY_LABELS[entry.category] ?? entry.category}
          </Badge>
          <Badge variant={statusVisual.badgeVariant}>
            {LEARNING_STATUS_LABELS[entry.status] ?? entry.status}
          </Badge>
        </div>
        <ProgressBar
          value={entry.progress}
          label={`${entry.title} progress`}
          variant={isCompleted ? 'success' : 'primary'}
        />
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-1">
          {hours ? (
            <span className="text-caption text-muted-foreground">{hours}</span>
          ) : (
            <span className="text-caption text-muted-foreground">{entry.progress}%</span>
          )}
          <span className="text-caption text-muted-foreground">
            Updated {new Date(entry.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <LinkedItems notes={linkedNotes} resources={linkedResources} notesLabel={notesLabel} />

      <div className="mt-auto flex items-center justify-end gap-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(entry)}
          aria-label={`Edit learning goal: ${entry.title}`}
        >
          <Pencil className="w-(--icon-sm) h-(--icon-sm)" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(entry)}
          aria-label={`Delete learning goal: ${entry.title}`}
        >
          <Trash2 className="w-(--icon-sm) h-(--icon-sm)" />
        </Button>
      </div>
    </Card>
  )
}