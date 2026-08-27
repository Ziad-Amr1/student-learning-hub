import { Pin, Pencil, Trash2 } from 'lucide-react'
import { cx } from '../../utils/cx'
import { formatLearningUnits } from '../../utils/learning'
import {
  LEARNING_CATEGORY_BADGE_VARIANT,
  LEARNING_CATEGORY_LABELS,
  LEARNING_STATUS_LABELS,
  LEARNING_STATUS_VISUALS,
} from '../../constants/learningStatus'
import { PINNED_CARD_VISUAL, PIN_BUTTON_ACTIVE_CLASSES } from '../../constants/cardStatus'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import LinkedItems from './LinkedItems'

// Card rhythm (07.6 refinement): Row 1 = title + pin/edit/delete actions;
// Row 2 = category + status badges; Row 3 = ProgressBar; Row 4 = unit/caption;
// then LinkedItems. The accent left border + tint belong to PINNING only
// (PINNED_CARD_VISUAL); unpinned cards carry only the status Badge + tint.
export default function LearningEntryCard({
  entry,
  linkedNotes = [],
  linkedResources = [],
  onTogglePin,
  onEdit,
  onDelete,
}) {
  const statusVisual = LEARNING_STATUS_VISUALS[entry.status] ?? LEARNING_STATUS_VISUALS['not-started']
  const isCompleted = entry.status === 'completed'
  const notesLabel = entry.category === 'book' ? 'Chapters' : 'Notes'
  const unitLabel = formatLearningUnits(entry)

  return (
    <Card
      className={cx(
        'p-4 flex flex-col gap-3 transition-[border-color,background-color]',
        entry.pinned
          ? cx(PINNED_CARD_VISUAL.borderClass, PINNED_CARD_VISUAL.bgClass)
          : cx(statusVisual.borderClass, statusVisual.bgClass)
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-base font-bold text-foreground">{entry.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePin(entry.id)}
            aria-label={entry.pinned ? 'Unpin learning goal' : 'Pin learning goal'}
            aria-pressed={entry.pinned}
            className={cx(entry.pinned && PIN_BUTTON_ACTIVE_CLASSES)}
          >
            <Pin className={cx('w-(--icon-sm) h-(--icon-sm)', entry.pinned && 'fill-current')} />
          </Button>
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
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm" variant={LEARNING_CATEGORY_BADGE_VARIANT}>
          {LEARNING_CATEGORY_LABELS[entry.category] ?? entry.category}
        </Badge>
        <Badge size="sm" variant={statusVisual.badgeVariant}>
          {LEARNING_STATUS_LABELS[entry.status] ?? entry.status}
        </Badge>
      </div>

      <ProgressBar
        value={entry.progress}
        label={`${entry.title} progress`}
        variant={isCompleted ? 'success' : 'primary'}
      />

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        {unitLabel ? (
          <span className="text-caption text-muted-foreground">{unitLabel}</span>
        ) : (
          <span className="text-caption text-muted-foreground">{entry.progress}%</span>
        )}
        <span className="text-caption text-muted-foreground">
          Updated {new Date(entry.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <LinkedItems notes={linkedNotes} resources={linkedResources} notesLabel={notesLabel} />
    </Card>
  )
}