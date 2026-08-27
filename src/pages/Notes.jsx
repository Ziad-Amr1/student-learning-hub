import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import ModuleToolbar from '../components/layout/ModuleToolbar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import FormDialog from '../components/ui/FormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { NOTES } from '../data/notes'
import NoteCard from './notes/NoteCard'

export default function Notes() {
  const [notes, setNotes] = useState(() => [...NOTES])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [titleError, setTitleError] = useState('')
  const [contentError, setContentError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const resetForm = () => {
    setTitle('')
    setContent('')
    setCategory('')
    setEditingNote(null)
    setTitleError('')
    setContentError('')
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
    setTitleError('')
    setContentError('')
    setFormOpen(true)
  }

  const handleSubmit = (e) => {
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

    const now = new Date().toISOString()

    if (editingNote) {
      setNotes(
        notes.map(n =>
          n.id === editingNote.id
            ? {
                ...n,
                title: title.trim(),
                content: content.trim(),
                category: category.trim() || undefined,
                updatedAt: now,
              }
            : n
        )
      )
    } else {
      const newNote = {
        id: crypto.randomUUID(),
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      }
      setNotes([newNote, ...notes])
    }
    resetForm()
    setFormOpen(false)
  }

  const handleTogglePin = (id) => {
    setNotes(notes.map(n =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    ))
  }

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      setNotes(notes.filter(n => n.id !== noteToDelete))
      setNoteToDelete(null)
    }
  }

  const sortedAndFiltered = notes
    .filter(n => {
      const q = searchQuery.toLowerCase()
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
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
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-(--icon-sm) h-(--icon-sm)" />
          <span className="hidden sm:inline">Add Note</span>
        </Button>
      </ModuleToolbar>

      <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedAndFiltered.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            {notes.length === 0
              ? 'No notes yet. Create one above.'
              : 'No notes match your search.'}
          </p>
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
