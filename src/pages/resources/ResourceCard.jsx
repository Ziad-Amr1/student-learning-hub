import { cx } from '../../utils/cx'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { ImageOff } from 'lucide-react'

const CATEGORY_VARIANT = {
  article: 'info',
  video: 'warning',
  course: 'default',
  book: 'secondary',
  tool: 'success',
  other: 'outline',
}

export default function ResourceCard({ resource, viewMode = 'list', onEdit, onDelete }) {
  if (viewMode === 'grid') {
    return (
      <Card className="p-5 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-foreground truncate">{resource.title}</h3>
            <Badge variant={CATEGORY_VARIANT[resource.category] ?? 'outline'}>
              {resource.category}
            </Badge>
          </div>
          <div className="flex items-center justify-center h-24 rounded-md border border-dashed border-border bg-surface-muted text-muted-foreground">
            <div className="flex flex-col items-center gap-1 text-caption">
              <ImageOff className="w-(--icon-md) h-(--icon-md)" />
              <span>No preview</span>
            </div>
          </div>
          {resource.description && (
            <p className="text-body-small text-muted-foreground leading-relaxed line-clamp-3">{resource.description}</p>
          )}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption text-primary font-medium hover:underline block truncate pt-1"
          >
            {resource.url}
          </a>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-caption text-muted-foreground">
            Added {new Date(resource.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">Visit</Button>
            </a>
            <Button variant="ghost" size="sm" onClick={() => onEdit(resource)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(resource.id)}>
              Delete
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5 flex flex-col justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-foreground truncate">{resource.title}</h3>
          <Badge variant={CATEGORY_VARIANT[resource.category] ?? 'outline'}>
            {resource.category}
          </Badge>
        </div>
        {resource.description && (
          <p className="text-body-small text-muted-foreground leading-relaxed">{resource.description}</p>
        )}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption text-primary font-medium hover:underline block truncate pt-1"
        >
          {resource.url}
        </a>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-caption text-muted-foreground">
          Added {new Date(resource.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">Visit</Button>
          </a>
          <Button variant="ghost" size="sm" onClick={() => onEdit(resource)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(resource.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}
