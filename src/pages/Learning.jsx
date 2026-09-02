import { useState } from 'react'
import { BookOpen, Plus, Search } from 'lucide-react'
import { cx } from '../utils/cx'
import { FIELD_CONTROL_CLASSES } from '../components/ui/formStyles'
import PageHeader from '../components/layout/PageHeader'
import ModuleToolbar from '../components/layout/ModuleToolbar'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import FormDialog from '../components/ui/FormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import useLocalStorage from '../hooks/useLocalStorage'
import { LEARNING_ENTRIES } from '../data/learning'
import { useNotes } from '../hooks/useNotes'
import { useResources } from '../hooks/useResources'
import {
  LEARNING_CATEGORIES,
  LEARNING_CATEGORY_LABELS,
  LEARNING_STATUSES,
  LEARNING_STATUS_LABELS,
} from '../constants/learningStatus'
import {
  deriveCurrentlyLearning,
  isCurrentlyLearning,
  normalizeLearningEntry,
  resolveLinkedIds,
  sortLearningEntries,
  LEARNING_SORT_OPTIONS,
} from '../utils/learning'
import CurrentlyLearning from './learning/CurrentlyLearning'
import LearningEntryCard from './learning/LearningEntryCard'
import LearningEntryForm from './learning/LearningEntryForm'

const EMPTY_FORM = {
  title: '',
  category: 'course',
  status: 'not-started',
  progress: '0',
  targetHours: '',
  completedHours: '',
  totalPages: '',
  videoMinutes: '',
  relatedNoteIds: [],
  relatedResourceIds: [],
}

const parseNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const checkNumber = (label, value) => {
  if (value.trim() === '') return null
  if (!Number.isFinite(Number(value))) return `${label} must be a number`
  if (Number(value) < 0) return `${label} cannot be negative`
  return null
}

const toggleInArray = (array, id) =>
  array.includes(id) ? array.filter((item) => item !== id) : [...array, id]

const CARD_GRID_CLASSES = 'grid gap-(--layout-card-gap) sm:grid-cols-2 xl:grid-cols-3'

export default function Learning() {
  const [entries, setEntries] = useLocalStorage('student-hub:learning', () => [...LEARNING_ENTRIES])
  const { notes } = useNotes()
  const { resources } = useResources()

  const [form, setForm] = useState(EMPTY_FORM)
  const [editingEntry, setEditingEntry] = useState(null)
  const [titleError, setTitleError] = useState('')
  const [numericError, setNumericError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortMode, setSortMode] = useState('manual')

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (numericError) setNumericError('')
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingEntry(null)
    setTitleError('')
    setNumericError('')
  }

  const handleOpenCreate = () => {
    resetForm()
    setFormOpen(true)
  }

  const handleStartEdit = (entry) => {
    setEditingEntry(entry)
    setForm({
      title: entry.title,
      category: entry.category,
      status: entry.status,
      progress: String(entry.progress ?? 0),
      targetHours: entry.targetHours == null ? '' : String(entry.targetHours),
      completedHours: entry.completedHours == null ? '' : String(entry.completedHours),
      totalPages: entry.totalPages == null ? '' : String(entry.totalPages),
      videoMinutes: entry.videoMinutes == null ? '' : String(entry.videoMinutes),
      relatedNoteIds: entry.relatedNotes || [],
      relatedResourceIds: entry.relatedResources || [],
    })
    setTitleError('')
    setFormOpen(true)
  }

  const handleTitleChange = (value) => {
    setField('title', value)
    if (titleError) setTitleError('')
  }

  const handleStatusChange = (value) => {
    setField('status', value)
    if (value === 'completed') setField('progress', '100')
  }

  const buildSavePayload = () => {
    const now = new Date().toISOString()
    const { status, progress, targetHours, completedHours } = form

    // normalizeLearningEntry centralizes the progress<->status rule (decision 4).
    let next = normalizeLearningEntry({
      status,
      progress: parseNumber(progress),
    })

    const base = {
      title: form.title.trim(),
      category: form.category,
      status: next.status,
      progress: next.progress,
      targetHours: form.category === 'book' || form.category === 'video'
        ? undefined
        : targetHours.trim() === ''
          ? undefined
          : parseNumber(targetHours),
      completedHours: form.category === 'book' || form.category === 'video'
        ? undefined
        : completedHours.trim() === ''
          ? undefined
          : parseNumber(completedHours),
      totalPages:
        form.category === 'book' && form.totalPages.trim() !== ''
          ? parseNumber(form.totalPages)
          : undefined,
      videoMinutes:
        form.category === 'video' && form.videoMinutes.trim() !== ''
          ? parseNumber(form.videoMinutes)
          : undefined,
      relatedNotes: form.relatedNoteIds,
      relatedResources: form.relatedResourceIds,
    }

    if (editingEntry) {
      next = { ...editingEntry, ...base, updatedAt: now }
      if (!next.startedAt && next.status === 'in-progress') next.startedAt = now
      next.completedAt = next.status === 'completed' ? (next.completedAt ?? now) : null
      return next
    }

    next = {
      ...base,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      startedAt: next.status === 'in-progress' ? now : null,
      completedAt: next.status === 'completed' ? now : null,
    }
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) {
      setTitleError('Title is required')
      return
    }
    if (title.length > 120) {
      setTitleError('Title must be 120 characters or fewer')
      return
    }
    setTitleError('')

    const numericError =
      checkNumber('Progress', form.progress) ||
      checkNumber('Target hours', form.targetHours) ||
      checkNumber('Completed hours', form.completedHours) ||
      checkNumber('Total pages', form.totalPages) ||
      checkNumber('Video minutes', form.videoMinutes)
    if (!numericError && form.progress.trim() !== '' && Number(form.progress) > 100) {
      setNumericError('Progress must be between 0 and 100')
      return
    }
    if (numericError) {
      setNumericError(numericError)
      return
    }
    setNumericError('')

    const next = buildSavePayload()
    if (editingEntry) {
      setEntries(entries.map((entry) => (entry.id === editingEntry.id ? next : entry)))
    } else {
      setEntries([next, ...entries])
    }
    resetForm()
    setFormOpen(false)
  }

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      setEntries(entries.filter((entry) => entry.id !== entryToDelete.id))
      setEntryToDelete(null)
    }
  }

  const handleToggleNote = (id) =>
    setField('relatedNoteIds', toggleInArray(form.relatedNoteIds, id))
  const handleToggleResource = (id) =>
    setField('relatedResourceIds', toggleInArray(form.relatedResourceIds, id))

  // Pinned is persisted as part of the entity; toggling does NOT bump
  // updatedAt (Notes/Resources precedent — a pin is an organization action,
  // not a content edit).
  const handleTogglePin = (id) =>
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, pinned: !entry.pinned } : entry)))

  const normalizedEntries = entries.map(normalizeLearningEntry)
  const orderedEntries = sortLearningEntries(normalizedEntries, sortMode)
  const currentlyLearning = deriveCurrentlyLearning(orderedEntries)
  const otherEntries = orderedEntries.filter((entry) => !isCurrentlyLearning(entry))

  const isFiltering =
    searchQuery.trim() !== '' || filterCategory !== 'all' || filterStatus !== 'all'

  const filteredEntries = normalizedEntries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
    const matchesCategory = filterCategory === 'all' || entry.category === filterCategory
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const decorate = (list) =>
    list.map((entry) => ({
      entry,
      linkedNotes: resolveLinkedIds(entry.relatedNotes, notes),
      linkedResources: resolveLinkedIds(entry.relatedResources, resources),
    }))

  const currentItems = decorate(currentlyLearning)
  const otherItems = decorate(otherEntries)
  const allItems = decorate(sortLearningEntries(filteredEntries, sortMode))

  const hasNoEntries = entries.length === 0

  return (
    <article className="space-y-0">
      <PageHeader
        title="Learning"
        description="Your personal learning workspace — what you're studying and how far along you are."
      />

      <ModuleToolbar>
        <Input
          label="Search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search learning..."
          className="flex-1 min-w-[120px] [&>label]:sr-only"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={cx(FIELD_CONTROL_CLASSES, '!w-auto text-sm cursor-pointer')}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {LEARNING_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {LEARNING_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={cx(FIELD_CONTROL_CLASSES, '!w-auto text-sm cursor-pointer')}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {LEARNING_STATUSES.map((status) => (
            <option key={status} value={status}>
              {LEARNING_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          className={cx(FIELD_CONTROL_CLASSES, '!w-auto text-sm cursor-pointer')}
          aria-label="Sort learning"
        >
          {LEARNING_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-(--icon-sm) h-(--icon-sm)" />
          <span className="hidden sm:inline">Add Goal</span>
        </Button>
      </ModuleToolbar>

      <div className="flex flex-col gap-(--layout-section-gap) pt-6">
        {hasNoEntries ? (
          <EmptyState
            icon={BookOpen}
            title="No learning goals yet"
            description="Create your first goal from the toolbar above."
          />
        ) : isFiltering ? (
          <section aria-label="Learning collection">
            <h2 className="sr-only">Learning collection</h2>
            {filteredEntries.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No goals match your search or filters"
              />
            ) : (
              <div className={CARD_GRID_CLASSES}>
                {allItems.map(({ entry, linkedNotes, linkedResources }) => (
                  <LearningEntryCard
                    key={entry.id}
                    entry={entry}
                    linkedNotes={linkedNotes}
                    linkedResources={linkedResources}
                    onTogglePin={handleTogglePin}
                    onEdit={handleStartEdit}
                    onDelete={setEntryToDelete}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <CurrentlyLearning
              items={currentItems}
              onTogglePin={handleTogglePin}
              onEdit={handleStartEdit}
              onDelete={setEntryToDelete}
            />
            {otherItems.length > 0 && (
              <section aria-label="Other learning" className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2>Other Learning</h2>
                  <p className="text-body-small text-muted-foreground">
                    Not-started and completed goals.
                  </p>
                </div>
                <div className={CARD_GRID_CLASSES}>
                  {otherItems.map(({ entry, linkedNotes, linkedResources }) => (
                    <LearningEntryCard
                      key={entry.id}
                      entry={entry}
                      linkedNotes={linkedNotes}
                      linkedResources={linkedResources}
                      onTogglePin={handleTogglePin}
                      onEdit={handleStartEdit}
                      onDelete={setEntryToDelete}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <FormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          resetForm()
        }}
        onSubmit={handleSubmit}
        title={editingEntry ? 'Edit Learning Goal' : 'Add Learning Goal'}
        submitLabel={editingEntry ? 'Save Changes' : 'Add Goal'}
      >
        <LearningEntryForm
          title={form.title}
          category={form.category}
          status={form.status}
          progress={form.progress}
          targetHours={form.targetHours}
          completedHours={form.completedHours}
          totalPages={form.totalPages}
          videoMinutes={form.videoMinutes}
          relatedNoteIds={form.relatedNoteIds}
          relatedResourceIds={form.relatedResourceIds}
          notes={notes}
          resources={resources}
          titleError={titleError}
          numericError={numericError}
          onTitleChange={handleTitleChange}
          onCategoryChange={(value) => setField('category', value)}
          onStatusChange={handleStatusChange}
          onProgressChange={(value) => setField('progress', value)}
          onTargetHoursChange={(value) => setField('targetHours', value)}
          onCompletedHoursChange={(value) => setField('completedHours', value)}
          onTotalPagesChange={(value) => setField('totalPages', value)}
          onVideoMinutesChange={(value) => setField('videoMinutes', value)}
          onToggleNote={handleToggleNote}
          onToggleResource={handleToggleResource}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Learning Goal"
        message="Are you sure you want to delete this learning goal? This action cannot be undone. Related notes and resources are not affected."
      />
    </article>
  )
}