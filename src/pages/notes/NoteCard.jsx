import { Pin } from 'lucide-react'
import { cx } from '../../utils/cx'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

export default function NoteCard({ note, onEdit, onTogglePin, onDelete }) {
  const preview = note.content.length > 160 ? note.content.slice(0, 160) + '...' : note.content

  return (
    <Card
      className={cx(
        'p-5 flex flex-col justify-between space-y-3 transition-[border-color,background-color]',
        note.pinned && 'border-l-2 border-l-warning bg-warning-soft/20'
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-foreground truncate">{note.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            {note.pinned && (
              <span className="text-warning-strong" aria-label="Pinned note">
                <Pin className="w-(--icon-sm) h-(--icon-sm)" />
              </span>
            )}
            {note.category && <Badge variant="secondary">{note.category}</Badge>}
          </div>
        </div>
        <p className="text-body-small text-muted-foreground whitespace-pre-wrap">{preview}</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-caption text-muted-foreground">
          {note.updatedAt !== note.createdAt
            ? `Edited ${timeAgo(note.updatedAt)}`
            : `Created ${timeAgo(note.createdAt)}`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePin(note.id)}
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            {note.pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onEdit(note)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(note.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateString).toLocaleDateString()
}
