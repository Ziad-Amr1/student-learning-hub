import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Resources() {
  const [resources, setResources] = useState(() => {
    const savedResources = localStorage.getItem('huby_resources');
    return savedResources ? JSON.parse(savedResources) : [
      {
        id: 'res-1',
        title: 'React Official Documentation',
        url: 'https://react.dev',
        category: 'Frontend',
        description: 'The primary library reference for hooks, components, and state management.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'res-2',
        title: 'Tailwind CSS Docs',
        url: 'https://tailwindcss.com',
        category: 'Design',
        description: 'Utility-first CSS framework for rapid UI development.',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceToDelete, setResourceToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem('huby_resources', JSON.stringify(resources));
  }, [resources]);

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const newResource = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      title,
      url,
      category,
      description,
      createdAt: new Date().toISOString()
    };

    setResources([newResource, ...resources]);
    setTitle('');
    setUrl('');
    setDescription('');
    setCategory('Frontend');
  };

  const confirmDelete = () => {
    if (resourceToDelete) {
      setResources(resources.filter(res => res.id !== resourceToDelete));
      setResourceToDelete(null);
    }
  };

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <article className="relative">
      <PageHeader
        className="mb-(--layout-section-gap)"
        title="Resources"
        description="Your saved learning resources, categorized and tracked."
      />
      
      {/* Add Resource Form */}
      <form onSubmit={handleAddResource} className="bg-white p-6 rounded-lg shadow-sm border mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="resource-title">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <Input 
              id="resource-title"
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Advanced React Course"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="resource-url">
              URL Link <span className="text-red-500">*</span>
            </label>
            <Input 
              id="resource-url"
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="resource-category">
              Category
            </label>
            <select 
              id="resource-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none bg-white text-gray-800 text-sm"
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="Design">Design</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="resource-desc">
              Description / Notes
            </label>
            <Input 
              id="resource-desc"
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this resource is about..."
            />
          </div>
        </div>

        <Button type="submit" variant="primary">
          Add Resource
        </Button>
      </form>

      {/* Search Bar */}
      <div className="mb-6">
        <Input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search resources by title, category, or description..."
        />
      </div>

      {/* Resources Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-4">No resources found matching your search.</p>
        ) : (
          filteredResources.map(res => (
            <Card key={res.id} className="p-5 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-800">{res.title}</h3>
                  <Badge variant="purple">{res.category}</Badge>
                </div>
                {res.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{res.description}</p>
                )}
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-600 hover:underline block truncate pt-1 font-medium"
                >
                  🔗 {res.url}
                </a>
                <span className="text-xs text-gray-400 block pt-1">
                  Added at: {new Date(res.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm">
                    Visit Link
                  </Button>
                </a>

                <Button variant="danger" size="sm" onClick={() => setResourceToDelete(res.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {resourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 border border-gray-100">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Delete Confirmation</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete this resource? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end items-center gap-3 pt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setResourceToDelete(null)}
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