import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { cx } from '../utils/cx'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { RESOURCES } from '../data/resources'
import ResourceCard from './resources/ResourceCard'

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

  const handleStartEdit = (resource) => {
    setEditingResource(resource)
    setTitle(resource.title)
    setUrl(resource.url)
    setCategory(resource.category)
    setDescription(resource.description || '')
    setTitleError('')
    setUrlError('')
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
    <article className="space-y-6">
      <PageHeader
        title="Resources"
        description="Your curated learning resources, organized by category."
        actions={
          <div className="flex items-center gap-1" role="group" aria-label="View mode">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
            >
              <List className="w-(--icon-sm) h-(--icon-sm)" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-(--icon-sm) h-(--icon-sm)" />
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-lg shadow-sm border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-label text-foreground" htmlFor="resource-category">Category</label>
            <select
              id="resource-category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cx(
                'w-full bg-surface border border-input rounded-md px-3 py-2 text-foreground',
                'transition-[border-color,box-shadow] duration-150 ease-standard',
                'focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-soft)] focus:outline-none',
                'text-sm cursor-pointer'
              )}
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

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary">
            {editingResource ? 'Save Changes' : 'Add Resource'}
          </Button>
          {editingResource && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <Input
        label="Search"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search resources by title or description..."
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={cx(
              'px-3 py-1.5 rounded-full text-caption font-semibold border transition-colors',
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
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
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

      {resourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-xs p-4">
          <div className="bg-surface rounded-2xl shadow-lg max-w-sm w-full p-6 space-y-5 border border-border">
            <div className="space-y-2">
              <h3 className="text-h3 font-bold text-foreground">Delete Resource</h3>
              <p className="text-body-small text-muted-foreground leading-relaxed">
                Are you sure you want to delete this resource? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end items-center gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setResourceToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
