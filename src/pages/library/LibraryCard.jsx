import { ChevronDown, Pencil, Star, Trash2 } from 'lucide-react'
import { cx } from '../../utils/cx'
import { formatPageProgress, formatReadingDate } from '../../utils/library'
import {
  LIBRARY_MAX_RATING,
  LIBRARY_STATUS_LABELS,
  LIBRARY_STATUS_VISUALS,
} from '../../constants/libraryStatus'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/Tooltip'
import LibraryDetail from './LibraryDetail'

// My Library card (scope §9): Row 1 = title + details/edit/delete; Row 2 =
// status badge + rating stars; Row 3 = author caption; Row 4 = ProgressBar;
// Row 5 = reading-date + updated caption; then the expandable detail panel.
// Library books have no pin in v1, so no accent PINNED_CARD_VISUAL border —
// statuses keep only their Badge variant + optional tint (unlike the
// LearningEntryCard, the status/pin border collision cannot occur here).
function RatingStars({ rating }) {
  if (!rating) return null
  return (
    <span
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={`Rated ${rating} of ${LIBRARY_MAX_RATING} stars`}
    >
      {Array.from({ length: LIBRARY_MAX_RATING }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cx(
            'w-(--icon-sm) h-(--icon-sm)',
            index < rating ? 'fill-current text-warning-strong' : 'text-border'
          )}
        />
      ))}
    </span>
  )
}

export default function LibraryCard({
  entry,
  linkedResources = [],
  linkedLearning = [],
  expanded = false,
  onToggleDetails,
  onEdit,
  onDelete,
}) {
  const statusVisual =
    LIBRARY_STATUS_VISUALS[entry.status] ?? LIBRARY_STATUS_VISUALS['want-to-read']
  const readingDate = formatReadingDate(entry)
  // Books with a page count show WHERE the reader is ("100 of 400 pages"), not
  // only the derived percentage — that is the whole point of entering a page
  // count, and it sits directly under the bar it explains. Null when the book
  // has no page count, so percentage-only books are unchanged.
  const pageProgress = formatPageProgress(entry)

  return (
    <Card className={cx('p-4 flex flex-col gap-3 transition-[background-color]', statusVisual.bgClass)}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-base font-bold text-foreground wrap-anywhere">{entry.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleDetails(entry.id)}
                aria-label={`${expanded ? 'Hide' : 'Show'} details for ${entry.title}`}
                aria-expanded={expanded}
                aria-controls={`library-detail-${entry.id}`}
              >
                <ChevronDown
                  className={cx(
                    'w-(--icon-sm) h-(--icon-sm) transition-transform',
                    expanded && 'rotate-180'
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{expanded ? 'Hide details' : 'Show details'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry)}
                aria-label={`Edit book: ${entry.title}`}
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
                onClick={() => onDelete(entry)}
                aria-label={`Delete book: ${entry.title}`}
              >
                <Trash2 className="w-(--icon-sm) h-(--icon-sm)" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm" variant={statusVisual.badgeVariant}>
          {LIBRARY_STATUS_LABELS[entry.status] ?? entry.status}
        </Badge>
        <RatingStars rating={entry.rating} />
      </div>

      {entry.author && (
        <p className="text-caption text-muted-foreground">by {entry.author}</p>
      )}

      <ProgressBar
        value={entry.progress}
        label={`${entry.title} progress`}
        variant={entry.status === 'finished' ? 'success' : 'primary'}
      />

      {pageProgress && (
        <p className="text-caption text-muted-foreground -mt-1">{pageProgress}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        {readingDate ? (
          <span className="text-caption text-muted-foreground">{readingDate}</span>
        ) : (
          <span className="text-caption text-muted-foreground">{entry.progress}%</span>
        )}
        <span className="text-caption text-muted-foreground">
          Updated {new Date(entry.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {expanded && (
        <LibraryDetail
          id={`library-detail-${entry.id}`}
          entry={entry}
          linkedResources={linkedResources}
          linkedLearning={linkedLearning}
        />
      )}
    </Card>
  )
}