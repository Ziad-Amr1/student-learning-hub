import { useState } from 'react'
import { Plus, LayoutGrid, List, GalleryHorizontalEnd } from 'lucide-react'
import { cx } from '../utils/cx'
import { FIELD_CONTROL_CLASSES } from '../components/ui/formStyles'
import PageHeader from '../components/layout/PageHeader'
import ModuleToolbar from '../components/layout/ModuleToolbar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import FormDialog from '../components/ui/FormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { RESOURCES } from '../data/resources'
import ResourceCard from './resources/ResourceCard'

const VIEW_OPTIONS = [
  { id: 'list', icon: List, label: 'List view' },
  { id: 'grid', icon: LayoutGrid, label: 'Grid view' },
  { id: 'grid-preview', icon: GalleryHorizontalEnd, label: 'Grid with preview' },
]

export default function Resources() {
  const [resources, setResources] = useState(() => [...RESOURCES])
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

  const handleSubmit = (e) => {
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
      setResources(resources.map(r =>
        r.id === editingResource.id
          ? {
              ...r,
              title: title.trim(),
              url: url.trim(),
              category,
              description: description.trim() || undefined,
            }
          : r
      ))
    } else {
      const newResource = {
        id: crypto.randomUUID(),
        title: title.trim(),
        url: url.trim(),
        category,
        description: description.trim() || undefined,
        createdAt: new Date().toISOString(),
      }
      setResources([newResource, ...resources])
    }
    resetForm()
    setFormOpen(false)
  }

  const handleConfirmDelete = () => {
    if (resourceToDelete) {
      setResources(resources.filter(r => r.id !== resourceToDelete))
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
          className="flex-1 min-w-[200px] sm:[&>label]:sr-only"
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
      </ModuleToolbar>

      <div className="pt-3">
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter by category">
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

        <div className={cx(
          viewMode === 'list' && 'space-y-3',
          viewMode === 'grid' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
          viewMode === 'grid-preview' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        )}>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8 bg-surface rounded-lg border border-border">
              {resources.length === 0
                ? 'No resources available yet.'
                : 'No resources match your search or filter.'}
            </p>
          ) : (
            filtered.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                viewMode={viewMode}
                onEdit={handleStartEdit}
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
