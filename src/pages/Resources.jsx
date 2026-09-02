import { useState } from 'react'
import { LayoutGrid, Library, List, GalleryHorizontalEnd, Plus, Search } from 'lucide-react'
import { cx } from '../utils/cx'
import { FIELD_CONTROL_CLASSES } from '../components/ui/formStyles'
import PageHeader from '../components/layout/PageHeader'
import ModuleToolbar from '../components/layout/ModuleToolbar'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import FormDialog from '../components/ui/FormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useResources } from '../hooks/useResources'
import ResourceCard from './resources/ResourceCard'

const VIEW_OPTIONS = [
  { id: 'list', icon: List, label: 'List view' },
  { id: 'grid', icon: LayoutGrid, label: 'Grid view' },
  { id: 'grid-preview', icon: GalleryHorizontalEnd, label: 'Grid with preview' },
]

export default function Resources() {
  const {
    resources,
    loading,
    error,
    createResource,
    updateResource,
    deleteResource,
    refresh,
    migrationFailures,
  } = useResources()
  const [viewMode, setViewMode] = useState('list')

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('article')
  const [description, setDescription] = useState('')
  const [editingResource, setEditingResource] = useState(null)
  const [titleError, setTitleError] = useState('')
  const [urlError, setUrlError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const categories = ['all', ...new Set(resources.map(r => r.category))]

  const resetForm = () => {
    setTitle('')
    setUrl('')
    setCategory('article')
    setDescription('')
    setEditingResource(null)
    setTitleError('')
    setUrlError('')
  }

  const handleOpenCreate = () => {
    resetForm()
    setFormOpen(true)
  }

  const handleStartEdit = (resource) => {
    setEditingResource(resource)
    setTitle(resource.title)
    setUrl(resource.url)
    setCategory(resource.category)
    setDescription(resource.description || '')
    setTitleError('')
    setUrlError('')
    setFormOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let hasError = false
    if (!title.trim()) {
      setTitleError('Title is required')
      hasError = true
    }
    if (!url.trim()) {
      setUrlError('URL is required')
      hasError = true
    }
    if (hasError) return

    if (editingResource) {
      await updateResource(editingResource.id, {
        title: title.trim(),
        url: url.trim(),
        category,
        description: description.trim() || undefined,
      })
    } else {
      await createResource({
        title: title.trim(),
        url: url.trim(),
        category,
        description: description.trim() || undefined,
      })
    }
    resetForm()
    setFormOpen(false)
  }

  const handleTogglePin = async (id) => {
    const resource = resources.find((r) => r.id === id)
    if (!resource) return
    await updateResource(id, { pinned: !resource.pinned })
  }

  const handleConfirmDelete = async () => {
    if (resourceToDelete) {
      await deleteResource(resourceToDelete)
      setResourceToDelete(null)
    }
  }

  const filtered = resources.filter(r => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      r.title.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const visible = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return 0
  })

  return (
    <article className="space-y-0">
      <PageHeader
        title="Resources"
        description="Your curated learning resources, organized by category."
      />

      <ModuleToolbar>
        <Input
          label="Search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search resources..."
          className="flex-1 min-w-[120px] [&>label]:sr-only"
        />
        <div className="flex items-center gap-1" role="group" aria-label="View mode">
          {VIEW_OPTIONS.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={viewMode === id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(id)}
              aria-pressed={viewMode === id}
              aria-label={label}
            >
              <Icon className="w-(--icon-sm) h-(--icon-sm)" />
            </Button>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-(--icon-sm) h-(--icon-sm)" />
          <span className="hidden sm:inline">Add Resource</span>
        </Button>
        <div className="flex flex-wrap gap-2 w-full" role="group" aria-label="Filter by category">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={cx(
                'px-3 py-1.5 rounded-full text-caption font-semibold border transition-colors cursor-pointer',
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted'
              )}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </ModuleToolbar>

      {error && (
        <div
          role="alert"
          className="mt-4 flex flex-col gap-3 rounded-lg border border-destructive-soft bg-destructive-soft/20 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-body-small text-foreground">
            We couldn't load your resources. {error} — make sure the Huby backend is running.
          </p>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}

      {migrationFailures && migrationFailures.length > 0 && (
        <p role="alert" className="mt-4 text-body-small text-destructive-strong">
          {migrationFailures.length} resources could not be imported from the previous
          local data and have been preserved for a retry.
        </p>
      )}

      <div className="pt-3">

        <div className={cx(
          viewMode === 'list' && 'space-y-3',
          viewMode === 'grid' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
          viewMode === 'grid-preview' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        )}>
          {loading && resources.length === 0 ? (
            <p className="text-body-small text-muted-foreground col-span-full">Loading resources…</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              className="col-span-full"
              icon={resources.length === 0 ? Library : Search}
              title={
                resources.length === 0
                  ? 'No resources yet'
                  : 'No resources match your search or filter'
              }
              description={
                resources.length === 0
                  ? 'Add your first resource from the toolbar above.'
                  : undefined
              }
            />
          ) : (
            visible.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                viewMode={viewMode}
                onEdit={handleStartEdit}
                onTogglePin={handleTogglePin}
                onDelete={setResourceToDelete}
              />
            ))
          )}
        </div>
      </div>

      <FormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); resetForm() }}
        onSubmit={handleSubmit}
        title={editingResource ? 'Edit Resource' : 'Add Resource'}
        submitLabel={editingResource ? 'Save Changes' : 'Add Resource'}
      >
        <Input
          label="Resource Title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (titleError) setTitleError('')
          }}
          placeholder="e.g., React official docs"
          required
          error={titleError}
        />
        <Input
          label="URL"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (urlError) setUrlError('')
          }}
          placeholder="https://..."
          required
          error={urlError}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-label text-foreground" htmlFor="resource-category">Category</label>
            <select
              id="resource-category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cx(FIELD_CONTROL_CLASSES, 'w-full text-sm cursor-pointer')}
            >
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="course">Course</option>
              <option value="book">Book</option>
              <option value="tool">Tool</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this resource..."
            rows={3}
          />
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!resourceToDelete}
        onClose={() => setResourceToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
      />
    </article>
  )
}
