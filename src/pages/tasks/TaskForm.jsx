import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

export default function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDateInput, setDueDateInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: Date.now().toString(),
      title,
      description,
      priority,
      status,
      dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null,
      createdAt: new Date().toISOString()
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDateInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border mb-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-700 font-medium" htmlFor="task-title-input">
            Task Title <span className="text-red-500">*</span>
          </label>
          <Input 
            id="task-title-input"
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Finish React hooks exercise"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700 font-medium" htmlFor="task-priority-select">Priority</label>
            <select 
              id="task-priority-select"
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
            <label className="text-xs text-gray-700 font-medium" htmlFor="task-status-select">Status</label>
            <select 
              id="task-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none bg-white text-gray-800 text-sm"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-700 font-medium" htmlFor="task-due-date">Due Date & Time</label>
          <Input 
            id="task-due-date"
            type="datetime-local"
            value={dueDateInput}
            onChange={(e) => setDueDateInput(e.target.value)}
          />
        </div>
      </div>

      <Textarea 
        label="Task Description / Details"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Write a brief summary or notes..."
        rows={2}
      />

      <Button type="submit" variant="primary">
        Add Task
      </Button>
    </form>
  );
}