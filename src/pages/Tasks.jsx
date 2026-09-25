import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListTodo, Plus, Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/Select'
import PageHeader from '../components/layout/PageHeader'
import ModuleToolbar from '../components/layout/ModuleToolbar'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ErrorBanner from '../components/ui/ErrorBanner'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import FormDialog from '../components/ui/FormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useTasks } from '../hooks/useTasks'
import { normalizeTaskStatus } from '../utils/taskStatus'
import { TASK_SORT_OPTIONS, sortTasks } from '../utils/taskSort'
import TaskCard from './tasks/TaskCard'

export default function Tasks() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, refresh, migrationFailures } =
    useTasks()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('unstarted')
  const [dueDateInput, setDueDateInput] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [titleError, setTitleError] = useState('')
  const [actionError, setActionError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('manual')
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setStatus('unstarted')
    setDueDateInput('')
    setEditingTask(null)
    setTitleError('')
    setActionError('')
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
    setStatus(normalizeTaskStatus(task.status))
    setDueDateInput(task.dueDate ? task.dueDate.slice(0, 16) : '')
    setTitleError('')
    setActionError('')
    setFormOpen(true)
  }

  // Opening the edit dialog when arriving from the Dashboard's recent-tasks
  // list (?edit=<id>) — reuses the card Edit flow, no new route/backend.
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId) return
    const task = tasks.find((t) => t.id === editId)
    if (!task) return
    handleStartEdit(task)
    const next = new URLSearchParams(searchParams)
    next.delete('edit')
    setSearchParams(next, { replace: true })
  }, [searchParams, tasks])

  const handleSubmit = async (e) => {
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
    setActionError('')
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null,
      }
      if (editingTask) {
        await updateTask(editingTask.id, payload)
      } else {
        await createTask(payload)
      }
      resetForm()
      setFormOpen(false)
    } catch (err) {
      setActionError(err.message || 'Could not save this task.')
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    setActionError('')
    try {
      await updateTask(id, { status: newStatus })
    } catch (err) {
      setActionError(err.message || 'Could not update this task.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return
    setActionError('')
    try {
      await deleteTask(taskToDelete)
    } catch (err) {
      setActionError(err.message || 'Could not delete this task.')
    }
    setTaskToDelete(null)
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || normalizeTaskStatus(t.status) === filterStatus
    return matchesSearch && matchesPriority && matchesStatus
  })

  const visibleTasks = sortTasks(filteredTasks, sortBy)

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
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger aria-label="Filter by priority" className="px-3 py-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger aria-label="Filter by status" className="px-3 py-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="unstarted">Unstarted</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="deferred">Deferred</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger aria-label="Sort tasks" className="px-3 py-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-(--icon-sm) h-(--icon-sm)" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </ModuleToolbar>

      {error && (
        <ErrorBanner
          className="mt-4"
          message={`${error} — make sure the Huby backend is running.`}
          onRetry={refresh}
        />
      )}

      {actionError && (
        <p role="alert" className="mt-4 text-body-small text-destructive-strong">
          {actionError}
        </p>
      )}

      {migrationFailures && migrationFailures.length > 0 && (
        <p role="alert" className="mt-4 text-body-small text-destructive-strong">
          {migrationFailures.length} tasks could not be imported from the previous
          local data and have been preserved for a retry.
        </p>
      )}

      <div className="pt-6 space-y-3">
        {loading && tasks.length === 0 ? (
          <p className="text-body-small text-muted-foreground">Loading tasks…</p>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={tasks.length === 0 ? ListTodo : Search}
            title={
              tasks.length === 0
                ? 'No tasks yet'
                : 'No tasks match your search or filters'
            }
            description={
              tasks.length === 0
                ? 'Create your first task from the toolbar above.'
                : undefined
            }
          />
        ) : (
          visibleTasks.map((task) => (
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
            <Select value={priority} onValueChange={setPriority} name="priority">
              <SelectTrigger id="task-priority" className="w-full px-3 py-2 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label text-foreground" htmlFor="task-status">Status</label>
            <Select value={status} onValueChange={setStatus} name="status">
              <SelectTrigger id="task-status" className="w-full px-3 py-2 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unstarted">Unstarted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="deferred">Deferred</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
