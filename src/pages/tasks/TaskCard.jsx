import React from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

function getTimeRemaining(dueDate) {
  if (!dueDate) return null;
  const total = Date.parse(dueDate) - Date.parse(new Date());
  if (total <= 0) return { expired: true };

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, expired: false };
}

export default function TaskCard({ task, onUpdateStatus, onDelete }) {
  const timeLeft = getTimeRemaining(task.dueDate);

  return (
    <Card className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
          <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}>
            {task.priority}
          </Badge>
          <Badge variant={task.status === 'done' ? 'success' : task.status === 'in-progress' ? 'purple' : 'default'}>
            {task.status}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600">{task.description}</p>
        )}

        {task.dueDate && (
          <div className="mt-1.5">
            {timeLeft?.expired ? (
              <span className="inline-block text-red-700 bg-red-100/80 border border-red-200 px-2.5 py-1 rounded-md text-xs font-medium">
                ⚠️ Due date passed
              </span>
            ) : (
              <span className="inline-block text-amber-700 bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-medium">
                ⏳ Time left: {timeLeft?.days}d {timeLeft?.hours}h {timeLeft?.minutes}m {timeLeft?.seconds}s
              </span>
            )}
          </div>
        )}

        <span className="text-xs text-gray-400 block mt-1">Created at: {new Date(task.createdAt).toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <select 
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value)}
          className="text-sm px-3 py-1 border rounded-md bg-gray-50 text-gray-700 cursor-pointer"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <Button variant="danger" size="sm" onClick={() => onDelete(task.id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}