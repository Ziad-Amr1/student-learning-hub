import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select'
import Collapsible from '../../components/ui/Collapsible'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import {
  FIELD_CONTROL_ERROR_CLASSES,
  FIELD_ERROR_CLASSES,
  FIELD_REQUIRED_CLASSES,
} from '../../components/ui/formStyles'
import {
  LIBRARY_MAX_RATING,
  LIBRARY_STATUSES,
  LIBRARY_STATUS_LABELS,
} from '../../constants/libraryStatus'
import { LEARNING_STATUS_LABELS } from '../../constants/learningStatus'
import ProgressField from './ProgressField'
import { learningStatusForLibraryStatus } from './libraryFlow.js'
import { LIBRARY_FIELD_IDS } from './libraryFormFields'
import { cx } from '../../utils/cx'

// Form body rendered inside FormDialog (FormDialog owns the <form>). Field
// state lives in the page (Learning.jsx precedent). One component serves both
// Add and Edit — there is no per-dialog fork, so validation UX, required
// markers, and error presentation are identical in both (phase-0 requirement 3).
//
// Structure (phase-0 requirement 4): the default view is the BOOK ITSELF —
// identity, status, reading progress, rating, and the personal reading notes.
// The two optional linking sections (Resources / Learning) are Collapsibles
// that are CLOSED by default, so advanced linking never dominates the dialog.
//
// Relationship selection uses native checkboxes (LearningEntryForm precedent).
// My Library is a probe of the Future writing-experience plan, but in v1 the
// book `notes` and `quotes` fields are PLAIN TEXT (scope §9 record): the
// markdown-like authoring surface belongs to Sprint 16's editor, not here.
const selectFieldClass = 'w-full px-3 py-2 text-sm'

function LinkList({ items, selectedIds, onToggle, emptyHint }) {
  if (items.length === 0) {
    return <p className="text-body-small text-muted-foreground">{emptyHint}</p>
  }
  return (
    <div className="max-h-40 overflow-y-auto scrollbar-hub space-y-1 rounded-md border border-border p-2">
      {items.map((item) => {
        const checked = selectedIds.includes(item.id)
        return (
          <label
            key={item.id}
            className="flex items-start gap-2 cursor-pointer rounded p-1 text-body-small hover:bg-surface-muted"
          >
            <input
              type="checkbox"
              className="mt-0.5 accent-primary"
              checked={checked}
              onChange={() => onToggle(item.id)}
            />
            <span className="min-w-0 flex-1 break-words">{item.title}</span>
          </label>
        )
      })}
    </div>
  )
}

const linkedMeta = (count) => (count > 0 ? `${count} linked` : 'none linked')

export default function LibraryEntryForm({
  title,
  author,
  status,
  progress,
  currentPages,
  totalPages,
  rating,
  notes,
  quotes,
  progressMode,
  relatedResourceIds,
  relatedLearningIds,
  resources,
  learning,
  isEdit,
  alsoResource,
  resourceUrl,
  alsoLearning,
  linkPending,
  errors = {},
  onTitleChange,
  onAuthorChange,
  onStatusChange,
  onProgressModeChange,
  onProgressChange,
  onCurrentPagesChange,
  onTotalPagesChange,
  onRatingChange,
  onNotesChange,
  onQuotesChange,
  onToggleResource,
  onToggleLearning,
  onToggleAlsoResource,
  onResourceUrlChange,
  onToggleAlsoLearning,
}) {
  const statusErrorId = 'library-status-error'
  const seedStatus = learningStatusForLibraryStatus(status)

  return (
    <>
      <Input
        id={LIBRARY_FIELD_IDS.title}
        label="Title"
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="e.g., Atomic Habits"
        required
        error={errors.title}
      />
      <Input
        id={LIBRARY_FIELD_IDS.author}
        label="Author"
        type="text"
        value={author}
        onChange={(e) => onAuthorChange(e.target.value)}
        placeholder="e.g., James Clear"
        autoComplete="off"
        error={errors.author}
      />

      <div className="flex flex-col gap-2 sm:max-w-64">
        <label className="text-label text-foreground" htmlFor="library-status">
          Status
          <span className={FIELD_REQUIRED_CLASSES} aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger
            id={LIBRARY_FIELD_IDS.status}
            className={cx(selectFieldClass, errors.status && FIELD_CONTROL_ERROR_CLASSES)}
            aria-required="true"
            aria-invalid={errors.status ? true : undefined}
            aria-describedby={errors.status ? statusErrorId : undefined}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIBRARY_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {LIBRARY_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className={FIELD_ERROR_CLASSES} id={statusErrorId} role="alert">
            {errors.status}
          </p>
        )}
      </div>

      <ProgressField
        mode={progressMode}
        progress={progress}
        currentPages={currentPages}
        totalPages={totalPages}
        errors={errors}
        locked={status === 'finished'}
        onModeChange={onProgressModeChange}
        onProgressChange={onProgressChange}
        onCurrentPagesChange={onCurrentPagesChange}
        onTotalPagesChange={onTotalPagesChange}
      />
      {status === 'finished' && (
        <p className="text-caption text-muted-foreground">
          Progress is locked at 100% while the book is finished.
        </p>
      )}

      <Input
        id={LIBRARY_FIELD_IDS.rating}
        label={`Rating (0–${LIBRARY_MAX_RATING})`}
        type="number"
        min="0"
        max={LIBRARY_MAX_RATING}
        value={rating}
        onChange={(e) => onRatingChange(e.target.value)}
        placeholder="Optional"
        error={errors.rating}
        className="sm:max-w-64"
      />

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="What did you think of it?"
        rows={3}
      />
      <Textarea
        label="Quotes (one per line)"
        value={quotes}
        onChange={(e) => onQuotesChange(e.target.value)}
        placeholder={'"We are what we repeatedly do."'}
        rows={3}
      />

      <Collapsible
        summary="Resources"
        meta={linkedMeta(relatedResourceIds.length)}
        className="border-t border-border pt-4"
        panelClassName="flex flex-col gap-3"
      >
        <p className="text-caption text-muted-foreground">
          Link a resource you already saved, or create a Resource entry for this book.
        </p>
        <LinkList
          items={resources}
          selectedIds={relatedResourceIds}
          onToggle={onToggleResource}
          emptyHint="No resources yet — add some on the Resources page, or create one below."
        />

        <label className="flex items-start gap-2 cursor-pointer text-body-small">
          <input
            type="checkbox"
            className="mt-0.5 accent-primary"
            checked={alsoResource}
            disabled={linkPending}
            onChange={onToggleAlsoResource}
          />
          <span>Add a new Resource entry for this book</span>
        </label>
        {alsoResource && (
          <div className="pl-6">
            <Input
              id={LIBRARY_FIELD_IDS.resourceUrl}
              label="Resource URL"
              type="url"
              value={resourceUrl}
              onChange={(e) => onResourceUrlChange(e.target.value)}
              placeholder="https://…"
              required
              disabled={linkPending}
              error={errors.resourceUrl}
            />
            <p className="text-caption text-muted-foreground">
              A Resource needs a link to where the book lives.
              {isEdit &&
                ' Resources already linked to this book are kept as they are, and saving again adds this one alongside them.'}
            </p>
          </div>
        )}
      </Collapsible>

      <Collapsible
        summary="Learning"
        meta={linkedMeta(relatedLearningIds.length)}
        panelClassName="flex flex-col gap-3"
      >
        <p className="text-caption text-muted-foreground">
          Link a learning goal you already track, or add this book as one.
        </p>
        <LinkList
          items={learning}
          selectedIds={relatedLearningIds}
          onToggle={onToggleLearning}
          emptyHint="No learning goals yet — add some on the Learning page, or create one below."
        />

        <label className="flex items-start gap-2 cursor-pointer text-body-small">
          <input
            type="checkbox"
            className="mt-0.5 accent-primary"
            checked={alsoLearning}
            disabled={linkPending}
            onChange={onToggleAlsoLearning}
          />
          <span>Add this book as a learning goal</span>
        </label>
        {alsoLearning && (
          <div className="pl-6">
            <p className="text-body-small text-foreground">
              Created as{' '}
              <span className="font-semibold">{LEARNING_STATUS_LABELS[seedStatus]}</span> at{' '}
              <span className="font-semibold">{progress}%</span>.
            </p>
            <p className="text-caption text-muted-foreground">
              The goal starts from this book's current status and progress, then
              becomes its own entry you manage on the Learning page.
            </p>
          </div>
        )}
      </Collapsible>
    </>
  )
}
