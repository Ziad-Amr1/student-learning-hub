import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';

export default function Resources() {
  const [resources, setResources] = useState(() => {
    const savedResources = localStorage.getItem('huby_resources');
    return savedResources ? JSON.parse(savedResources) : [
      { id: 1, title: 'React Documentation', url: 'https://react.dev' }
    ];
  });

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    localStorage.setItem('huby_resources', JSON.stringify(resources));
  }, [resources]);

  const addResource = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    const newResource = {
      id: Date.now(),
      title,
      url
    };
    setResources([newResource, ...resources]);
    setTitle('');
    setUrl('');
  };

  const deleteResource = (id) => {
    setResources(resources.filter(res => res.id !== id));
  };

  return (
    <article>
      <PageHeader
        className="mb-(--layout-section-gap)"
        title="Resources"
        description="Your saved learning resources."
      />
      
      {/* Add Resource Form */}
      <form onSubmit={addResource} className="bg-white p-5 rounded-lg shadow-sm border mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource Title (e.g., React Docs)..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          />
          <input 
            type="url" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (https://...)"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          />
        </div>
        <button 
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Add Resource
        </button>
      </form>

      {/* Resources List */}
      <div className="space-y-3">
        {resources.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No resources yet. Add one above!</p>
        ) : (
          resources.map(res => (
            <div key={res.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{res.title}</h3>
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {res.url}
                </a>
              </div>
              <button 
                onClick={() => deleteResource(res.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium ml-4"
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