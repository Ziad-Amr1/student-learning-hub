import { ExternalLink, Pencil, Trash2, ImageOff } from 'lucide-react'
import { cx } from '../../utils/cx'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

const CATEGORY_VARIANT = {
  article: 'info',
  video: 'warning',
  course: 'default',
  book: 'secondary',
  tool: 'success',
  other: 'outline',
}

function ResourceActions({ resource, viewMode, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <Button
        as="a"
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        variant="ghost"
        size="sm"
        aria-label={`Visit ${resource.title}`}
      >
        <ExternalLink className="w-(--icon-sm) h-(--icon-sm)" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(resource)}
        aria-label={`Edit resource: ${resource.title}`}
      >
        <Pencil className="w-(--icon-sm) h-(--icon-sm)" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(resource.id)}
        aria-label={`Delete resource: ${resource.title}`}
      >
        <Trash2 className="w-(--icon-sm) h-(--icon-sm)" />
      </Button>
    </div>
  )
}

export default function ResourceCard({ resource, viewMode = 'list', onEdit, onDelete }) {
  if (viewMode === 'grid-preview') {
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
          <span className="text-caption text-primary font-medium truncate block pt-1">
            {resource.url}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-caption text-muted-foreground">
            Added {new Date(resource.createdAt).toLocaleDateString()}
          </span>
          <ResourceActions resource={resource} viewMode={viewMode} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </Card>
    )
  }

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
          {resource.description && (
            <p className="text-body-small text-muted-foreground leading-relaxed line-clamp-3">{resource.description}</p>
          )}
          <span className="text-caption text-primary font-medium truncate block pt-1">
            {resource.url}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-caption text-muted-foreground">
            Added {new Date(resource.createdAt).toLocaleDateString()}
          </span>
          <ResourceActions resource={resource} viewMode={viewMode} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-foreground truncate">{resource.title}</h3>
          <Badge variant={CATEGORY_VARIANT[resource.category] ?? 'outline'}>
            {resource.category}
          </Badge>
        </div>
        {resource.description && (
          <p className="text-body-small text-muted-foreground leading-relaxed">{resource.description}</p>
        )}
        <span className="text-caption text-primary font-medium truncate block pt-1">
          {resource.url}
        </span>
        <span className="text-caption text-muted-foreground block pt-1">
          Added {new Date(resource.createdAt).toLocaleDateString()}
        </span>
      </div>
      <ResourceActions resource={resource} viewMode={viewMode} onEdit={onEdit} onDelete={onDelete} />
    </Card>
  )
}
