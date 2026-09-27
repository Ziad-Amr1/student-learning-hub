import { useId } from 'react'
import Input from '../../components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select'
import { FIELD_REQUIRED_CLASSES } from '../../components/ui/formStyles'
import { progressFromPages } from '../../utils/library'
import { LIBRARY_FIELD_IDS } from './libraryFormFields'

// Reading-progress control with two explicit modes (phase-0 decision 1).
// `progress` (0-100) is always the value that gets submitted; the pages mode
// only changes HOW it is edited:
//
//   Percentage - the user types the percentage directly.
//   Pages      - the user types "current of total"; the percentage is derived
//                on submit via progressFromPages(). `currentPages` is never
//                stored, so the two inputs cannot disagree.
//
// The mode is NOT a stored field: it is derived from whether the book has a
// total page count. Switching modes therefore never rewrites progress on its
// own — changing the page count preserves the percentage and simply re-derives
// the current page, and clearing the page count returns to percentage mode
// with the percentage intact.
//
// Errors are NOT computed here. The page validates the whole form once on
// submit and passes the messages down, so an unvisited field can never start
// shouting before the user has tried to submit (phase-0 requirement 3) and the
// validation rules stay defined in exactly one place.
export const PROGRESS_MODES = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'pages', label: 'Pages' },
]

const selectFieldClass = 'w-full px-3 py-2 text-sm'

export default function ProgressField({
  mode,
  progress,
  currentPages,
  totalPages,
  errors = {},
  locked = false,
  onModeChange,
  onProgressChange,
  onCurrentPagesChange,
  onTotalPagesChange,
}) {
  const modeId = useId()
  const modeLabelId = `${modeId}-label`
  const modeHelpId = `${modeId}-help`

  const hasBothPages = currentPages.trim() !== '' && totalPages.trim() !== ''
  const derived = hasBothPages ? progressFromPages(currentPages, totalPages) : null

  return (
    <div className="flex flex-col gap-2" data-testid="library-progress-field">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex flex-col gap-2 sm:w-40">
          <label className="text-label text-foreground" id={modeLabelId} htmlFor={modeId}>
            Progress by
            <span className={FIELD_REQUIRED_CLASSES} aria-hidden="true">
              {' '}
              *
            </span>
          </label>
          <Select value={mode} onValueChange={onModeChange}>
            <SelectTrigger
              id={modeId}
              aria-labelledby={modeLabelId}
              aria-describedby={modeHelpId}
              aria-required="true"
              className={selectFieldClass}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROGRESS_MODES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {mode === 'percentage' ? (
          <Input
            id={LIBRARY_FIELD_IDS.progress}
            label="Progress (%)"
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => onProgressChange(e.target.value)}
            required
            disabled={locked}
            error={errors.progress}
            className="flex-1 min-w-0"
          />
        ) : (
          <>
            <Input
              id={LIBRARY_FIELD_IDS.currentPages}
              label="Current page"
              type="number"
              min="0"
              value={currentPages}
              onChange={(e) => onCurrentPagesChange(e.target.value)}
              required
              disabled={locked}
              error={errors.currentPages}
              className="flex-1 min-w-0"
            />
            <Input
              id={LIBRARY_FIELD_IDS.totalPages}
              label="Total pages"
              type="number"
              min="1"
              value={totalPages}
              onChange={(e) => onTotalPagesChange(e.target.value)}
              required
              disabled={locked}
              error={errors.totalPages}
              className="flex-1 min-w-0"
            />
          </>
        )}
      </div>

      <p id={modeHelpId} className="text-caption text-muted-foreground">
        {mode === 'percentage'
          ? 'Enter how far through the book you are, from 0 to 100.'
          : 'Enter the page you are on. Your percentage is calculated automatically.'}
      </p>

      {mode === 'pages' && !locked && (
        <p className="text-caption text-muted-foreground" data-testid="library-progress-derived">
          {derived === null
            ? 'Your percentage will be calculated when both page values are filled in.'
            : `That is ${Math.round(derived)}% of the book.`}
        </p>
      )}
    </div>
  )
}
