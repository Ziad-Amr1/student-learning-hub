import { useState } from 'react'
import { NotebookPen, Plus, Search, X } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import ModuleToolbar from '../components/layout/ModuleToolbar'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import ErrorBanner from '../components/ui/ErrorBanner'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import FormDialog from '../components/ui/FormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/Select'
import { useNotes } from '../hooks/useNotes'
import {
  filterNotes,
  noteCategoryOptions,
  noteTagOptions,
  normalizeTags,
  NOTE_CATEGORY_ALL,
  NOTE_TAG_ALL,
} from '../utils/noteFilter'
import NoteCard from './notes/NoteCard'

export default function Notes() {
  const { notes, loading, error, createNote, updateNote, deleteNote, refresh, migrationFailures } =
    useNotes()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [editingNote, setEditingNote] = useState(null)
  const [titleError, setTitleError] = useState('')
  const [contentError, setContentError] = useState('')
  const [actionError, setActionError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState(NOTE_CATEGORY_ALL)
  const [filterTag, setFilterTag] = useState(NOTE_TAG_ALL)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const resetForm = () => {
    setTitle('')
    setContent('')
    setCategory('')
    setTagInput('')
    setTags([])
    setEditingNote(null)
    setTitleError('')
    setContentError('')
    setActionError('')
  }

  const handleOpenCreate = () => {
    resetForm()
    setFormOpen(true)
  }

  const handleStartEdit = (note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setCategory(note.category || '')
    setTags(Array.isArray(note.tags) ? [...note.tags] : [])
    setTagInput('')
    setTitleError('')
    setContentError('')
    setActionError('')
    setFormOpen(true)
  }

  // Commit the tag draft: Enter and comma both submit a tag, splitting on
  // commas so a pasted "a, b" yields two tags. Normalization runs on commit —
  // trim → lowercase → drop empty → dedupe, first-seen order — exactly the
  // Model's rule, so what the user commits equals what gets stored.
  const commitTagInput = () => {
    setTags((previous) => normalizeTags([...previous, ...tagInput.split(',')]))
    setTagInput('')
  }

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTagInput()
    }
  }

  const removeTag = (tag) => setTags((previous) => previous.filter((item) => item !== tag))

  const handleSubmit = async (e) => {
    e.preventDefault()
    let hasError = false
    if (!title.trim()) {
      setTitleError('Title is required')
      hasError = true
    }
    if (!content.trim()) {
      setContentError('Content is required')
      hasError = true
    }
    if (hasError) return

    setActionError('')
    // Commit any pending draft so a tag typed but not yet Enter-committed is
    // never silently dropped by a submit.
    const submittedTags = normalizeTags([...tags, ...tagInput.split(',')])
    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          title: title.trim(),
          content: content.trim(),
          category: category.trim() || undefined,
          tags: submittedTags,
        })
      } else {
        await createNote({
          title: title.trim(),
          content: content.trim(),
          category: category.trim() || undefined,
          tags: submittedTags,
        })
      }
      resetForm()
      setFormOpen(false)
    } catch (err) {
      setActionError(err.message || 'Could not save this note.')
    }
  }

  const handleTogglePin = async (id) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    setActionError('')
    try {
      await updateNote(id, { pinned: !note.pinned })
    } catch (err) {
      setActionError(err.message || 'Could not update this note.')
    }
  }

  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      setActionError('')
      try {
        await deleteNote(noteToDelete)
      } catch (err) {
        setActionError(err.message || 'Could not delete this note.')
      }
      setNoteToDelete(null)
    }
  }

  // Filter options are derived from the loaded data (no category/tag vocabulary
  // in the product). A selected category/tag that no longer exists falls back
  // to 'all' so the list can never be stranded showing nothing.
  const categoryOptions = noteCategoryOptions(notes)
  const tagOptions = noteTagOptions(notes)
  const activeCategory = categoryOptions.includes(filterCategory)
    ? filterCategory
    : NOTE_CATEGORY_ALL
  const activeTag = tagOptions.includes(filterTag) ? filterTag : NOTE_TAG_ALL

  const filteredNotes = filterNotes(notes, {
    query: searchQuery,
    category: activeCategory,
    tag: activeTag,
  })

  const sortedAndFiltered = filteredNotes.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return 0
  })

  return (
    <article className="space-y-0">
      <PageHeader
        title="Notes"
        description="Capture your study notes, thoughts, and technical snippets."
      />

      <ModuleToolbar>
        <Input
          label="Search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="flex-1 min-w-[120px] [&>label]:sr-only"
        />
        <Select value={activeCategory} onValueChange={setFilterCategory}>
          <SelectTrigger aria-label="Filter by category" className="px-3 py-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>
                {category === NOTE_CATEGORY_ALL ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={activeTag} onValueChange={setFilterTag}>
          <SelectTrigger aria-label="Filter by tag" className="px-3 py-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tagOptions.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag === NOTE_TAG_ALL ? 'All Tags' : tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-(--icon-sm) h-(--icon-sm)" />
          <span className="hidden sm:inline">Add Note</span>
        </Button>
      </ModuleToolbar>

      {error && (
        <ErrorBanner
          className="mt-4"
          message={`We couldn't load your notes. ${error} — make sure the Huby backend is running.`}
          onRetry={refresh}
        />
      )}

      {migrationFailures && migrationFailures.length > 0 && (
        <p role="alert" className="mt-4 text-body-small text-destructive-strong">
          {migrationFailures.length} notes could not be imported from the previous
          local data and have been preserved for a retry.
        </p>
      )}

      {actionError && (
        <p role="alert" className="mt-4 text-body-small text-destructive-strong">
          {actionError}
        </p>
      )}

      <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && notes.length === 0 ? (
          <p className="text-body-small text-muted-foreground col-span-full">Loading notes…</p>
        ) : sortedAndFiltered.length === 0 ? (
          <EmptyState
            className="col-span-full"
            icon={notes.length === 0 ? NotebookPen : Search}
            title={notes.length === 0 ? 'No notes yet' : 'No notes match your search or filters'}
            description={
              notes.length === 0
                ? 'Create your first note from the toolbar above.'
                : undefined
            }
          />
        ) : (
          sortedAndFiltered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleStartEdit}
              onTogglePin={handleTogglePin}
              onDelete={setNoteToDelete}
            />
          ))
        )}
      </div>

      <FormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); resetForm() }}
        onSubmit={handleSubmit}
        title={editingNote ? 'Edit Note' : 'Add Note'}
        submitLabel={editingNote ? 'Save Changes' : 'Add Note'}
      >
        <Input
          label="Note Title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (titleError) setTitleError('')
          }}
          placeholder="e.g., React Router v6 Notes"
          required
          error={titleError}
        />
        <Input
          label="Category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., React, CSS, Git"
        />
        <div className="space-y-2">
          <Input
            label="Tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="e.g., exam, revision — press Enter or comma to add"
            aria-describedby="tags-hint"
          />
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Added tags">
              {tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="secondary" size="sm">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="!h-4 !w-4 !gap-0 !p-0 -mr-1"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </Button>
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <p id="tags-hint" className="text-caption text-muted-foreground">
            Tags help you find notes later — press Enter or type a comma to add
            each one.
          </p>
        </div>
        <Textarea
          label="Content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (contentError) setContentError('')
          }}
          placeholder="Write your note content here..."
          rows={4}
          required
          error={contentError}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
      />
    </article>
  )
}
