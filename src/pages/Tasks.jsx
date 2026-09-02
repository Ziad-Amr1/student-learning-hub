import { useState } from 'react'
import { ListTodo, Plus, Search } from 'lucide-react'
import { cx } from '../utils/cx'
import { FIELD_CONTROL_CLASSES } from '../components/ui/formStyles'
import PageHeader from '../components/layout/PageHeader'
import ModuleToolbar from '../components/layout/ModuleToolbar'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import FormDialog from '../components/ui/FormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useTasks } from '../hooks/useTasks'
import { normalizeTaskStatus } from '../utils/taskStatus'
import { TASK_SORT_OPTIONS, sortTasks } from '../utils/taskSort'
import TaskCard from './tasks/TaskCard'

export default function Tasks() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, refresh } =
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
          <option value="unstarted">Unstarted</option>
          <option value="in-progress">In Progress</option>
          <option value="deferred">Deferred</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={cx(FIELD_CONTROL_CLASSES, '!w-auto text-sm cursor-pointer')}
          aria-label="Sort tasks"
        >
          {TASK_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-(--icon-sm) h-(--icon-sm)" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </ModuleToolbar>

      {error && (
        <div
          role="alert"
          className="mt-4 flex flex-col gap-3 rounded-lg border border-destructive-soft bg-destructive-soft/20 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-body-small text-foreground">
            {error} — make sure the Huby backend is running.
          </p>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}

      {actionError && (
        <p role="alert" className="mt-4 text-body-small text-destructive-strong">
          {actionError}
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
              <option value="unstarted">Unstarted</option>
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
