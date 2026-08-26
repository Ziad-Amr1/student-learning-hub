import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Notes() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('huby_notes');
    return savedNotes ? JSON.parse(savedNotes) : [
      {
        id: 'note-1',
        title: 'React Hooks Overview',
        content: 'Remember to use useState and useEffect properly for state management.',
        category: 'Frontend',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem('huby_notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNote = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      title,
      content,
      category,
      createdAt: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
    setCategory('Frontend');
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      setNotes(notes.filter(n => n.id !== noteToDelete));
      setNoteToDelete(null);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <article className="space-y-6">
      <PageHeader
        title="Notes"
        description="Capture your study notes, thoughts, and technical snippets."
      />

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs text-gray-700 font-medium" htmlFor="note-title">
              Note Title <span className="text-red-500">*</span>
            </label>
            <input 
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React Router v6 Notes"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white text-gray-800 text-sm h-[38px] border-gray-300"
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs text-gray-700 font-medium" htmlFor="note-category">
              Category
            </label>
            <select 
              id="note-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white text-gray-800 text-sm h-[38px] border-gray-300"
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-700 font-medium" htmlFor="note-content">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea 
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note content here..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white text-gray-800 text-sm h-24 border-gray-300"
            required
          />
        </div>

        <Button type="submit" variant="primary">
          Add Note
        </Button>
      </form>

      {/* Search Bar */}
      <div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes by title, content, or category..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white text-gray-800 text-sm h-[38px] border-gray-300"
        />
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-4 bg-white rounded-lg border">No notes found matching your search.</p>
        ) : (
          filteredNotes.map(note => (
            <Card key={note.id} className="p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">{note.title}</h3>
                  <Badge className="bg-slate-100 text-slate-800 border border-slate-200">
                    {note.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 whitespace-pre-wrap">{note.content}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">
                  {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                </span>
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
              <Button variant="secondary" size="sm" onClick={() => setNoteToDelete(null)}>
                No
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}