import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';

export default function Tasks() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('huby_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    localStorage.setItem('huby_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      completed: false
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <article>
      <PageHeader
        className="mb-(--layout-section-gap)"
        title="Tasks"
        description="Plan and track your study tasks."
      />
      
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
        >
          Add Task
        </button>
      </form>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No tasks yet. Add one above!</p>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border transition ${task.completed ? 'opacity-60 bg-gray-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
                <span className={`text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.title}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
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