import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Notes() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('huby_notes');
    return savedNotes ? JSON.parse(savedNotes) : [
      {
        id: '1',
        title: 'React Hooks Quick Reference',
        content: 'Remember that useState returns a stateful value and a function to update it.',
        category: 'Development',
        isPinned: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Tailwind CSS Layouts',
        content: 'Use grid-cols-1 md:grid-cols-2 for responsive grid layouts cleanly.',
        category: 'Study',
        isPinned: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Study');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem('huby_notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      category,
      isPinned: false,
      createdAt: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
    setCategory('Study');
  };

  const togglePinNote = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      setNotes(notes.filter(note => note.id !== noteToDelete));
      setNoteToDelete(null);
    }
  };

  // Filter notes based on search query, then sort pinned ones first
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  return (
    <article className="relative">
      <PageHeader
        className="mb-(--layout-section-gap)"
        title="Notes"
        description="Capture, search, pin, and organize your study notes efficiently."
      />
      
      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="bg-white p-6 rounded-lg shadow-sm border mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="note-title-input">
              Note Title <span className="text-red-500">*</span>
            </label>
            <Input 
              id="note-title-input"
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 4 Summary"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="note-category-select">
              Category
            </label>
            <select 
              id="note-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none bg-white text-gray-800 text-sm"
            >
              <option value="Study">Study</option>
              <option value="Development">Development</option>
              <option value="General">General</option>
              <option value="Ideas">Ideas</option>
            </select>
          </div>
        </div>

        <Textarea 
          label="Note Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notes or study points here..."
          rows={3}
          required
        />

        <Button type="submit" variant="primary">
          Add Note
        </Button>
      </form>

      {/* Search Bar */}
      <div className="mb-6">
        <Input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes by title, content, or category..."
        />
      </div>

      {/* Notes Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedNotes.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-4">No notes found matching your search.</p>
        ) : (
          sortedNotes.map(note => (
            <Card 
              key={note.id} 
              className={`p-5 flex flex-col justify-between gap-4 transition-all ${
                note.isPinned ? 'border-amber-400 bg-amber-50/25 shadow-sm' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {note.isPinned && <span className="text-amber-500 text-sm">📌</span>}
                    {note.title}
                  </h3>
                  <Badge variant="info">{note.category}</Badge>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                <span className="text-xs text-gray-400 block pt-2">
                  Created at: {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => togglePinNote(note.id)}
                >
                  {note.isPinned ? 'Unpin' : 'Pin to top'}
                </Button>

                <Button variant="danger" size="sm" onClick={() => setNoteToDelete(note.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 border border-gray-100">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Delete Confirmation</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end items-center gap-3 pt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setNoteToDelete(null)}
              >
                No
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={confirmDelete}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}