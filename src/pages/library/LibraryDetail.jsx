import { Link } from 'react-router-dom'
import { BookOpen, FolderOpen } from 'lucide-react'

// Inline (expanded) detail panel for a Library book — scope §9 decision:
// details expand IN PLACE on the card, there is NO /library/:id route.
// Shows the book's plain-text notes (v1: the markdown-like authoring surface
// belongs to Sprint 16), its quotes, and the outgoing Resource/Learning
// links. Notes/quotes are plain text rendered through React's default
// escaping — user content is untrusted (AGENTS.md §8).
function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-label text-foreground">{title}</h4>
      {children}
    </div>
  )
}

function LinkedList({ items, icon: Icon, to, caption }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <p className="text-label text-muted-foreground">{caption}</p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={to}
              className="inline-flex min-w-0 items-center gap-2 text-body-small text-foreground hover:underline focus-visible:underline"
              title={item.title}
            >
              <Icon
                className="h-(--icon-sm) w-(--icon-sm) shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="truncate">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function LibraryDetail({ id, entry, linkedResources = [], linkedLearning = [] }) {
  const hasNotesOrQuotes = !!entry.notes || entry.quotes.length > 0
  const hasLinks = linkedResources.length > 0 || linkedLearning.length > 0
  if (!hasNotesOrQuotes && !hasLinks) {
    return (
      <div id={id} className="space-y-3 border-t border-border pt-3">
        <p className="text-body-small text-muted-foreground">
          No notes, quotes or linked items for this book yet.
        </p>
      </div>
    )
  }

  return (
    <div id={id} className="space-y-3 border-t border-border pt-3">
      {hasNotesOrQuotes && (
        <div className="flex flex-col gap-3">
          {entry.notes && (
            <Section title="Notes">
              <p className="whitespace-pre-wrap text-body-small text-foreground wrap-anywhere">
                {entry.notes}
              </p>
            </Section>
          )}
          {entry.quotes.length > 0 && (
            <Section title="Quotes">
              <blockquote className="flex flex-col gap-1.5 pl-3 border-l-2 border-accent/40">
                {entry.quotes.map((quote, index) => (
                  <p key={index} className="text-body-small text-foreground wrap-anywhere">
                    &ldquo;{quote}&rdquo;
                  </p>
                ))}
              </blockquote>
            </Section>
          )}
        </div>
      )}

      {hasLinks && (
        <div className="flex flex-col gap-3">
          <LinkedList
            items={linkedResources}
            icon={FolderOpen}
            to="/resources"
            caption="Resources"
          />
          <LinkedList
            items={linkedLearning}
            icon={BookOpen}
            to="/learning"
            caption="Learning goals"
          />
        </div>
      )}
    </div>
  )
}