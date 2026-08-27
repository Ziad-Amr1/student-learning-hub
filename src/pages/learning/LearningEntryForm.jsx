import { cx } from '../../utils/cx'
import { FIELD_CONTROL_CLASSES } from '../../components/ui/formStyles'
import Input from '../../components/ui/Input'
import {
  LEARNING_CATEGORIES,
  LEARNING_CATEGORY_LABELS,
  LEARNING_STATUSES,
  LEARNING_STATUS_LABELS,
} from '../../constants/learningStatus'

// Form body rendered inside FormDialog (FormDialog owns the <form>). Field
// state lives in the page (Tasks.jsx precedent); this component organizes the
// fields and the relationship pickers. Relationship selection uses native
// checkboxes (decision 5) — no new primitive.
export default function LearningEntryForm({
  title,
  category,
  status,
  progress,
  targetHours,
  completedHours,
  relatedNoteIds,
  relatedResourceIds,
  notes,
  resources,
  titleError,
  onTitleChange,
  onCategoryChange,
  onStatusChange,
  onProgressChange,
  onTargetHoursChange,
  onCompletedHoursChange,
  onToggleNote,
  onToggleResource,
}) {
  const selectClass = cx(FIELD_CONTROL_CLASSES, 'text-sm cursor-pointer')

  return (
    <>
      <Input
        label="Title"
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="e.g., The Odin Project — React path"
        required
        error={titleError}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-label text-foreground" htmlFor="learning-category">
            Category
          </label>
          <select
            id="learning-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={selectClass}
          >
            {LEARNING_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {LEARNING_CATEGORY_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-label text-foreground" htmlFor="learning-status">
            Status
          </label>
          <select
            id="learning-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={selectClass}
          >
            {LEARNING_STATUSES.map((item) => (
              <option key={item} value={item}>
                {LEARNING_STATUS_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Progress (%)"
          type="number"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => onProgressChange(e.target.value)}
        />
        <Input
          label="Target hours"
          type="number"
          min="0"
          value={targetHours}
          onChange={(e) => onTargetHoursChange(e.target.value)}
        />
        <Input
          label="Completed hours"
          type="number"
          min="0"
          value={completedHours}
          onChange={(e) => onCompletedHoursChange(e.target.value)}
        />
      </div>
      {status === 'completed' && (
        <p className="text-caption text-muted-foreground">
          Progress is locked at 100% while the goal is completed.
        </p>
      )}

      <fieldset className="space-y-3">
        <legend className="text-label text-foreground">Link related items</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-label text-muted-foreground">Notes</p>
            {notes.length === 0 ? (
              <p className="text-body-small text-muted-foreground">
                No notes yet — create some on the Notes page.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-md border border-border p-2">
                {notes.map((note) => {
                  const checked = relatedNoteIds.includes(note.id)
                  return (
                    <label
                      key={note.id}
                      className="flex items-start gap-2 cursor-pointer rounded p-1 text-body-small hover:bg-surface-muted"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-primary"
                        checked={checked}
                        onChange={() => onToggleNote(note.id)}
                      />
                      <span className="min-w-0 flex-1 truncate">{note.title}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-label text-muted-foreground">Resources</p>
            {resources.length === 0 ? (
              <p className="text-body-small text-muted-foreground">
                No resources yet — add some on the Resources page.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-md border border-border p-2">
                {resources.map((resource) => {
                  const checked = relatedResourceIds.includes(resource.id)
                  return (
                    <label
                      key={resource.id}
                      className="flex items-start gap-2 cursor-pointer rounded p-1 text-body-small hover:bg-surface-muted"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-primary"
                        checked={checked}
                        onChange={() => onToggleResource(resource.id)}
                      />
                      <span className="min-w-0 flex-1 truncate">{resource.title}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </fieldset>
    </>
  )
}