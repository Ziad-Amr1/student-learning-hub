import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';

export default function Notes() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('huby_notes');
    return savedNotes ? JSON.parse(savedNotes) : [
      { id: 1, title: 'React Hooks Overview', content: 'Remember to use useState and useEffect properly for state management.', date: '2026-08-26' }
    ];
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    localStorage.setItem('huby_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const newNote = {
      id: Date.now(),
      title,
      content,
      date: new Date().toISOString().split('T')[0]
    };
    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <article>
      <PageHeader
        className="mb-(--layout-section-gap)"
        title="Notes"
        description="Capture and organize your notes."
      />
      
      {/* Add Note Form */}
      <form onSubmit={addNote} className="bg-white p-5 rounded-lg shadow-sm border mb-8 space-y-4">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
        />
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note content here..."
          rows="3"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 resize-none"
        ></textarea>
        <button 
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Add Note
        </button>
      </form>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.length === 0 ? (
          <p className="text-muted-foreground col-span-2 text-center py-4">No notes yet. Create your first note above!</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white p-5 rounded-lg shadow-sm border flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{note.title}</h3>
                  <span className="text-xs text-gray-400">{note.date}</span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap text-sm mb-4">{note.content}</p>
              </div>
              <button 
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium self-end"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </article>
  );
}