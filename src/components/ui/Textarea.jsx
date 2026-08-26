import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Tasks() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('huby_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      {
        id: 'task-1',
        title: 'Read one article about accessibility',
        description: 'Understand basic WCAG guidelines for web development.',
        priority: 'low',
        status: 'todo',
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-2',
        title: 'Prepare questions for mentor session',
        description: 'Write down technical blockers regarding Spring Boot and React.',
        priority: 'high',
        status: 'in-progress',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [status, setStatus] = useState('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem('huby_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      title,
      description,
      priority,
      status,
      createdAt: new Date().toISOString()
    };

    setTasks([newTask, ...tasks]);
    setTitle('');
    setDescription('');
    setPriority('low');
    setStatus('todo');
  };

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const nextStatus = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      setTaskToDelete(null);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <article className="relative space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage, organize, and track your daily engineering tasks."
      />
      
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="task-title">
              Task Title <span className="text-red-500">*</span>
            </label>
            <Input 
              id="task-title"
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fix navbar component bug"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="task-desc">
              Description
            </label>
            <Input 
              id="task-desc"
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about the task..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="task-priority">
              Priority
            </label>
            <select 
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none bg-white text-gray-800 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="task-status">
              Status
            </label>
            <select 
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none bg-white text-gray-800 text-sm"
            >
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <Button type="submit" variant="primary">
          Add Task
        </Button>
      </form>

      {/* Search Bar */}
      <div>
        <Input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks by title, priority, or status..."
        />
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4 bg-white rounded-lg border">No tasks found matching your search.</p>
        ) : (
          filteredTasks.map(task => (
            <Card key={task.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">{task.title}</h3>
                {task.description && (
                  <p className="text-xs text-gray-600">{task.description}</p>
                )}
                <span className="text-xs text-gray-400 block pt-1">
                  Created at: {new Date(task.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                {/* Status Badge */}
                <button onClick={() => toggleTaskStatus(task.id)} title="Click to change status" className="cursor-pointer">
                  <Badge className={task.status === 'in-progress' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-white text-gray-700 border border-gray-300'}>
                    {task.status}
                  </Badge>
                </button>

                {/* Priority Badge (Low بخلفية بيضاء ونظيفة) */}
                <Badge className={
                  task.priority === 'high' 
                    ? 'bg-rose-50 text-rose-900 border border-rose-100' 
                    : task.priority === 'medium' 
                    ? 'bg-slate-100 text-slate-800' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }>
                  {task.priority}
                </Badge>

                <Button variant="danger" size="sm" onClick={() => setTaskToDelete(task.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 border border-gray-100">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Delete Confirmation</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end items-center gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setTaskToDelete(null)}>
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