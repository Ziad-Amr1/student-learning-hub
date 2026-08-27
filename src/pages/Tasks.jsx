import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cx } from '../utils/cx'
import { FIELD_CONTROL_CLASSES } from '../components/ui/formStyles'
import PageHeader from '../components/layout/PageHeader'
import ModuleToolbar from '../components/layout/ModuleToolbar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import FormDialog from '../components/ui/FormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { TASKS } from '../data/tasks'
import useLocalStorage from '../hooks/useLocalStorage'
import TaskCard from './tasks/TaskCard'

export default function Tasks() {
  const [tasks, setTasks] = useLocalStorage('student-hub:tasks', () => [...TASKS])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('todo')
  const [dueDateInput, setDueDateInput] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [titleError, setTitleError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setStatus('todo')
    setDueDateInput('')
    setEditingTask(null)
    setTitleError('')
  }

  const handleOpenCreate = () => {
    resetForm()
    setFormOpen(true)
  }

  const handleStartEdit = (task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || '')
    setPriority(task.priority)
    setStatus(task.status)
    setDueDateInput(task.dueDate ? task.dueDate.slice(0, 16) : '')
    setTitleError('')
    setFormOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError('Title is required')
      return
    }
    if (title.trim().length > 120) {
      setTitleError('Title must be 120 characters or fewer')
      return
    }
    setTitleError('')

    if (editingTask) {
      setTasks(tasks.map(t =>
        t.id === editingTask.id
          ? {
              ...t,
              title: title.trim(),
              description: description.trim(),
              priority,
              status,
              dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null,
            }
          : t
      ))
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null,
        createdAt: new Date().toISOString(),
      }
      setTasks([newTask, ...tasks])
    }
    resetForm()
    setFormOpen(false)
  }

  const handleUpdateStatus = (id, newStatus) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, status: newStatus } : t
    ))
  }

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(t => t.id !== taskToDelete))
      setTaskToDelete(null)
    }
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus
    return matchesSearch && matchesPriority && matchesStatus
  })

  return (
    <article className="space-y-0">
      <PageHeader
        title="Tasks"
        description="Manage, organize, and track your daily engineering tasks."
      />

      <ModuleToolbar>
        <Input
          label="Search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="flex-1 min-w-[120px] [&>label]:sr-only"
        />
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className={cx(FIELD_CONTROL_CLASSES, '!w-auto text-sm cursor-pointer')}
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={cx(FIELD_CONTROL_CLASSES, '!w-auto text-sm cursor-pointer')}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="deferred">Deferred</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-(--icon-sm) h-(--icon-sm)" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </ModuleToolbar>

      <div className="pt-6 space-y-3">
        {filteredTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 bg-surface rounded-lg border border-border">
            {tasks.length === 0
              ? 'No tasks yet. Create one above.'
              : 'No tasks match your search or filters.'}
          </p>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleStartEdit}
              onUpdateStatus={handleUpdateStatus}
              onDelete={setTaskToDelete}
            />
          ))
        )}
      </div>

      <FormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); resetForm() }}
        onSubmit={handleSubmit}
        title={editingTask ? 'Edit Task' : 'Add Task'}
        submitLabel={editingTask ? 'Save Changes' : 'Add Task'}
      >
        <Input
          label="Task Title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (titleError) setTitleError('')
          }}
          placeholder="e.g., Finish React hooks exercise"
          required
          error={titleError}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief details about the task..."
          rows={2}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-label text-foreground" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              name="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={cx(FIELD_CONTROL_CLASSES, 'w-full text-sm cursor-pointer')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label text-foreground" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={cx(FIELD_CONTROL_CLASSES, 'w-full text-sm cursor-pointer')}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="deferred">Deferred</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Input
            label="Due Date"
            type="datetime-local"
            value={dueDateInput}
            onChange={(e) => setDueDateInput(e.target.value)}
          />
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </article>
  )
}
