import { Link } from 'react-router-dom'
import { Library, NotebookPen } from 'lucide-react'

// Read-only derived relationship panel (mind-map-lite, decision 6): groups the
// entry's linked notes/resources into a plain list. NO canvas/SVG/editor.
// `notesLabel` lets a book entry name its notes group "Chapters" — the
// book/collection concept is a data relationship only (decision 9).
export default function LinkedItems({ notes = [], resources = [], notesLabel = 'Notes' }) {
  if (notes.length === 0 && resources.length === 0) return null

  const groupClass = 'flex flex-col gap-1'
  const captionClass = 'text-label text-muted-foreground'
  const linkClass =
    'inline-flex min-w-0 items-center gap-2 text-body-small text-foreground hover:underline focus-visible:underline'

  return (
    <div className="flex flex-col gap-3 pt-1">
      {notes.length > 0 && (
        <div className={groupClass} aria-label={`${notesLabel} (${notes.length})`}>
          <p className={captionClass}>{notesLabel}</p>
          <ul className="flex flex-col gap-1">
            {notes.map((note) => (
              <li key={note.id}>
                <Link to="/notes" className={linkClass} title={note.title}>
                  <NotebookPen
                    className="h-(--icon-sm) w-(--icon-sm) shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate">{note.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resources.length > 0 && (
        <div className={groupClass} aria-label={`Resources (${resources.length})`}>
          <p className={captionClass}>Resources</p>
          <ul className="flex flex-col gap-1">
            {resources.map((resource) => (
              <li key={resource.id}>
                <Link to="/resources" className={linkClass} title={resource.title}>
                  <Library
                    className="h-(--icon-sm) w-(--icon-sm) shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate">{resource.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}