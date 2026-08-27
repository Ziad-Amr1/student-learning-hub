import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
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

  const resetForm = () => {
    setTitle('')
    setContent('')
    setCategory('')
    setEditingNote(null)
    setTitleError('')
    setContentError('')
  }

  const handleStartEdit = (note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setCategory(note.category || '')
    setTitleError('')
    setContentError('')
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
    <article className="space-y-6">
      <PageHeader
        title="Notes"
        description="Capture your study notes, thoughts, and technical snippets."
      />

      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-lg shadow-sm border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary">
            {editingNote ? 'Save Changes' : 'Add Note'}
          </Button>
          {editingNote && (
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
        placeholder="Search notes by title or content..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-xs p-4">
          <div className="bg-surface rounded-2xl shadow-lg max-w-sm w-full p-6 space-y-5 border border-border">
            <div className="space-y-2">
              <h3 className="text-h3 font-bold text-foreground">Delete Note</h3>
              <p className="text-body-small text-muted-foreground leading-relaxed">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end items-center gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setNoteToDelete(null)}>
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
