import { Pin, Pencil, Trash2 } from 'lucide-react'
import { cx } from '../../utils/cx'
import { timeAgo } from '../../utils/date'
import { PINNED_CARD_VISUAL, PIN_BUTTON_ACTIVE_CLASSES } from '../../constants/cardStatus'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

export default function NoteCard({ note, onEdit, onTogglePin, onDelete }) {
  const preview = note.content.length > 160 ? note.content.slice(0, 160) + '...' : note.content

  return (
    <Card
      className={cx(
        'p-5 flex flex-col justify-between space-y-3 transition-[border-color,background-color]',
        note.pinned
          ? cx(PINNED_CARD_VISUAL.borderClass, PINNED_CARD_VISUAL.bgClass)
          : 'hover:border-border/80'
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-foreground truncate">{note.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            {note.category && <Badge variant="secondary">{note.category}</Badge>}
          </div>
        </div>
        <p className="text-body-small text-muted-foreground whitespace-pre-wrap wrap-anywhere">{preview}</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-caption text-muted-foreground">
          {note.updatedAt !== note.createdAt
            ? `Edited ${timeAgo(note.updatedAt)}`
            : `Created ${timeAgo(note.createdAt)}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePin(note.id)}
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            aria-pressed={note.pinned}
            className={cx(
              note.pinned && PIN_BUTTON_ACTIVE_CLASSES
            )}
          >
            <Pin className={cx('w-(--icon-sm) h-(--icon-sm)', note.pinned && 'fill-current')} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note)}
            aria-label={`Edit note: ${note.title}`}
          >
            <Pencil className="w-(--icon-sm) h-(--icon-sm)" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            aria-label={`Delete note: ${note.title}`}
          >
            <Trash2 className="w-(--icon-sm) h-(--icon-sm)" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
