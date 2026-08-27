import { cx } from '../../utils/cx'
import LearningEntryCard from './LearningEntryCard'

// "Currently Learning" section (decision 5): entries explicitly in-progress or
// paused, resolved with their linked notes/resources for the card preview.
export default function CurrentlyLearning({ items, onEdit, onDelete, className }) {
  if (items.length === 0) return null

  return (
    <section aria-label="Currently learning" className={cx('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-1">
        <h2>Currently Learning</h2>
        <p className="text-body-small text-muted-foreground">
          Goals you've marked as in progress or paused.
        </p>
      </div>
      <div className="grid gap-(--layout-card-gap) sm:grid-cols-2 xl:grid-cols-3">
        {items.map(({ entry, linkedNotes, linkedResources }) => (
          <LearningEntryCard
            key={entry.id}
            entry={entry}
            linkedNotes={linkedNotes}
            linkedResources={linkedResources}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  )
}