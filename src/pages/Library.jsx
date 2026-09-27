import { useState } from 'react'
import { Library as LibraryIcon, Plus, Search } from 'lucide-react'
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
import FormDialog from '../components/ui/FormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useLibrary } from '../hooks/useLibrary.js'
import { useResources } from '../hooks/useResources.js'
import { useLearning } from '../hooks/useLearning.js'
import { LIBRARY_STATUSES, LIBRARY_STATUS_LABELS } from '../constants/libraryStatus'
import {
  normalizeLibraryEntry,
  pagesFromProgress,
  progressFromPages,
  resolveLinkedIds,
  sortLibraryEntries,
  validatePageInput,
  LIBRARY_SORT_OPTIONS,
} from '../utils/library'
import LibraryCard from './library/LibraryCard'
import LibraryEntryForm from './library/LibraryEntryForm'
import {
  createBookWithHybridLinks,
  learningStatusForLibraryStatus,
  linkBookTargets,
} from './library/libraryFlow.js'
import {
  LIBRARY_FIELD_IDS,
  LIBRARY_FIELD_ORDER,
  libraryFormFromEntry,
  validateLibraryForm,
} from './library/libraryFormFields'

const EMPTY_FORM = {
  title: '',
  author: '',
  status: 'want-to-read',
  progress: '0',
  currentPages: '',
  totalPages: '',
  rating: '',
  notes: '',
  quotes: '',
  relatedResourceIds: [],
  relatedLearningIds: [],
  alsoResource: false,
  resourceUrl: '',
  alsoLearning: false,
}

const parseNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseOptionalRating = (value) => {
  if (value.trim() === '') return undefined
  return parseNumber(value)
}

const parseQuotes = (value) =>
  value
    .split('\n')
    .map((quote) => quote.trim())
    .filter(Boolean)

const toggleInArray = (array, id) =>
  array.includes(id) ? array.filter((item) => item !== id) : [...array, id]

// Validation itself lives in ./library/libraryFormFields.js, shared verbatim by
// Add and Edit (phase-0 requirement 3). This page only *applies* the result:
// store the messages, focus the first invalid control, or submit.

const CARD_GRID_CLASSES = 'grid gap-(--layout-card-gap) sm:grid-cols-2 xl:grid-cols-3'

export default function Library() {
  const {
    library,
    loading,
    error,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    refresh,
    migrationFailures,
  } = useLibrary()
  const { resources, createResource } = useResources()
  const { learning, createLearning } = useLearning()
  const entries = library ?? []

  const [form, setForm] = useState(EMPTY_FORM)
  const [editingBook, setEditingBook] = useState(null)
  const [errors, setErrors] = useState({})
  const [formAlert, setFormAlert] = useState('')
  const [actionError, setActionError] = useState('')
  const [linkPending, setLinkPending] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formSession, setFormSession] = useState(0)
  const [bookToDelete, setBookToDelete] = useState(null)
  const [expandedIds, setExpandedIds] = useState([])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortMode, setSortMode] = useState('manual')

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    // Editing a field clears only that field's error, so a corrected input
    // stops shouting immediately without hiding the others.
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingBook(null)
    setErrors({})
    setFormAlert('')
    setLinkPending(false)
  }

  const handleOpenCreate = () => {
    resetForm()
    setFormSession((n) => n + 1)
    setFormOpen(true)
  }

  const handleStartEdit = (book) => {
    setEditingBook(book)
    setForm(libraryFormFromEntry(book))
    setErrors({})
    setFormAlert('')
    setActionError('')
    setFormSession((n) => n + 1)
    setFormOpen(true)
  }

  const handleStatusChange = (value) => {
    setField('status', value)
    if (value === 'finished') setField('progress', '100')
  }

  // Entering/leaving pages mode re-derives the visible values WITHOUT touching
  // `progress` in storage terms: switching to pages fills in the current page
  // implied by the current percentage, and switching back to percentage writes
  // the percentage implied by the current page. Leaving pages mode with an empty
  // total keeps the last percentage exactly as it was.
  const handleProgressModeChange = (mode) => {
    if (mode === 'pages') {
      const total = form.totalPages.trim()
      setForm((prev) => ({
        ...prev,
        progressMode: mode,
        currentPages:
          prev.currentPages !== '' ? prev.currentPages : total === '' ? '' : String(pagesFromProgress(prev) ?? 0),
      }))
      return
    }
    setForm((prev) => {
      const total = prev.totalPages.trim()
      const current = prev.currentPages.trim()
      if (total !== '' && current !== '' && !validatePageInput(current, total).currentPages) {
        const derived = progressFromPages(current, total)
        if (derived !== null) return { ...prev, progressMode: mode, progress: String(Math.round(derived)) }
      }
      return { ...prev, progressMode: mode }
    })
  }

  const buildSavePayload = (progress, totalPages) => {
    const next = normalizeLibraryEntry({
      status: form.status,
      progress,
    })
    return {
      title: form.title.trim(),
      author: form.author.trim() === '' ? null : form.author.trim(),
      status: next.status,
      progress: next.progress,
      rating: parseOptionalRating(form.rating),
      totalPages,
      notes: form.notes.trim() === '' ? null : form.notes,
      quotes: parseQuotes(form.quotes),
      relatedResourceIds: form.relatedResourceIds,
      relatedLearningIds: form.relatedLearningIds,
    }
  }

  const focusFirstInvalid = (fieldErrors) => {
    const target = LIBRARY_FIELD_ORDER.find((field) => fieldErrors[field])
    if (!target) return
    // Radix renders the Select trigger with the id we passed, so one lookup
    // covers inputs, textareas, and the status select trigger.
    const element = document.getElementById(LIBRARY_FIELD_IDS[target])
    if (element && typeof element.focus === 'function') element.focus()
  }

  const describeFailures = (failures) =>
    `The book was saved, but ${failures.length} linked item${
      failures.length === 1 ? '' : 's'
    } ${failures.length === 1 ? 'was' : 'were'} not created: ` +
    failures.map((failure) => `${failure.target} — ${failure.message}`).join(' ')

  // A rejected fetch arrives as a TypeError whose message is the browser's
  // "Failed to fetch" — a developer's sentence, not something a student can act
  // on. Server-provided messages (the API's `{ message }`) ARE written for
  // people, so those are shown as they come.
  const describeSubmitError = (err, fallback) => {
    if (err instanceof TypeError) {
      return 'Could not reach the Huby server. Check that it is running, then try again.'
    }
    return err?.message || fallback
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { errors: fieldErrors, progress, totalPages } = validateLibraryForm(form)
    setErrors(fieldErrors)
    setActionError('')

    if (Object.keys(fieldErrors).length > 0) {
      setFormAlert('')
      focusFirstInvalid(fieldErrors)
      return
    }

    setFormAlert('')
    const payload = buildSavePayload(progress, totalPages)
    const title = payload.title
    const resourcePending = form.alsoResource
      ? { title, url: form.resourceUrl.trim() }
      : null
    const learningPending = form.alsoLearning
      ? {
          title,
          status: learningStatusForLibraryStatus(payload.status),
          progress: payload.progress,
        }
      : null

    if (editingBook) {
      // Edit: save the book first, then create any NEW links. Same hybrid
      // primitive as Add, so a target failure can never cost the user their
      // book edit or an existing link.
      setLinkPending(true)
      try {
        const saved = await updateLibrary(editingBook.id, payload)
        const { book, failures } = await linkBookTargets({
          book: saved,
          resourcePending,
          learningPending,
          createResource,
          createLearning,
          updateBook: updateLibrary,
        })
        setLinkPending(false)
        if (failures.length > 0) {
          setFormAlert(describeFailures(failures))
          setExpandedIds((ids) => [...new Set([...ids, book.id])])
          return
        }
        resetForm()
        setFormOpen(false)
      } catch (err) {
        setLinkPending(false)
        setFormAlert(describeSubmitError(err, 'Could not save this book.'))
      }
      return
    }

    try {
      const { book, failures } = await createBookWithHybridLinks({
        bookPayload: payload,
        resourcePending,
        learningPending,
        createBook: createLibrary,
        createResource,
        createLearning,
        updateBook: updateLibrary,
      })
      if (failures.length > 0) {
        setFormAlert(describeFailures(failures))
        return
      }
      if (book) {
        const nextExpanded = form.alsoResource || form.alsoLearning ? [book.id] : []
        setExpandedIds((ids) => [...new Set([...ids, ...nextExpanded])])
      }
      resetForm()
      setFormOpen(false)
    } catch (err) {
      setFormAlert(describeSubmitError(err, 'Could not save this book.'))
    }
  }

  const handleConfirmDelete = async () => {
    if (bookToDelete) {
      setActionError('')
      try {
        await deleteLibrary(bookToDelete.id)
        setExpandedIds((ids) => ids.filter((id) => id !== bookToDelete.id))
      } catch (err) {
        setActionError(describeSubmitError(err, 'Could not delete this book.'))
      }
      setBookToDelete(null)
    }
  }

  const handleToggleResource = (id) =>
    setField('relatedResourceIds', toggleInArray(form.relatedResourceIds, id))
  const handleToggleLearning = (id) =>
    setField('relatedLearningIds', toggleInArray(form.relatedLearningIds, id))

  const handleToggleDetails = (id) =>
    setExpandedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    )

  const normalizedEntries = entries.map(normalizeLibraryEntry)

  const isFiltering = searchQuery.trim() !== '' || filterStatus !== 'all'

  const filteredEntries = normalizedEntries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (entry.author ?? '').toLowerCase().includes(searchQuery.trim().toLowerCase())
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const decorate = (list) =>
    list.map((entry) => ({
      entry,
      linkedResources: resolveLinkedIds(entry.relatedResourceIds, resources),
      linkedLearning: resolveLinkedIds(entry.relatedLearningIds, learning),
    }))

  const allItems = decorate(sortLibraryEntries(filteredEntries, sortMode))
  const hasNoEntries = entries.length === 0

  // Pages mode is implied by the presence of a total page count; the stored
  // `progressMode` only remembers the user's last choice within this dialog.
  const progressMode = form.progressMode ?? (form.totalPages.trim() === '' ? 'percentage' : 'pages')

  return (
    <article className="space-y-0">
      <PageHeader
        title="My Library"
        description="Your personal book shelf — what you're reading, what shaped you, and what's next."
      />

      <ModuleToolbar>
        <Input
          label="Search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search books..."
          className="flex-1 min-w-[120px] [&>label]:sr-only"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger aria-label="Filter by status" className="px-3 py-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LIBRARY_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {LIBRARY_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortMode} onValueChange={setSortMode}>
          <SelectTrigger aria-label="Sort library" className="px-3 py-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIBRARY_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-(--icon-sm) h-(--icon-sm)" />
          <span className="hidden sm:inline">Add Book</span>
        </Button>
      </ModuleToolbar>

      {error && (
        <ErrorBanner
          className="mt-4"
          message={`We couldn't load your library. ${error} — make sure the Huby backend is running.`}
          onRetry={refresh}
        />
      )}

      {migrationFailures && migrationFailures.length > 0 && (
        <p role="alert" className="mt-4 text-body-small text-destructive-strong">
          {migrationFailures.length} book{(migrationFailures.length === 1 ? '' : 's')} could
          not be imported from the previous local data and
          {migrationFailures.length === 1 ? ' has' : ' have'} been preserved for a retry.
        </p>
      )}

      {actionError && (
        <p role="alert" className="mt-4 text-body-small text-destructive-strong">
          {actionError}
        </p>
      )}

      <div className="flex flex-col gap-(--layout-section-gap) pt-6">
        {loading && entries.length === 0 ? (
          <p className="text-body-small text-muted-foreground">Loading your library…</p>
        ) : hasNoEntries ? (
          <EmptyState
            icon={LibraryIcon}
            title="Your shelf is empty"
            description="Add your first book from the toolbar above — no reading list is too small to start."
          />
        ) : isFiltering ? (
          <section aria-label="Library collection">
            <h2 className="sr-only">Library collection</h2>
            {filteredEntries.length === 0 ? (
              <EmptyState icon={Search} title="No books match your search or filters" />
            ) : (
              <div className={CARD_GRID_CLASSES}>
                {allItems.map(({ entry, linkedResources, linkedLearning }) => (
                  <LibraryCard
                    key={entry.id}
                    entry={entry}
                    linkedResources={linkedResources}
                    linkedLearning={linkedLearning}
                    expanded={expandedIds.includes(entry.id)}
                    onToggleDetails={handleToggleDetails}
                    onEdit={handleStartEdit}
                    onDelete={setBookToDelete}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section aria-label={`All books (${entries.length})`}>
            <div className="flex flex-col gap-1">
              <h2>All Books</h2>
              <p className="text-body-small text-muted-foreground">
                Every book on your shelf, newest first.
              </p>
            </div>
            <div className={CARD_GRID_CLASSES}>
              {allItems.map(({ entry, linkedResources, linkedLearning }) => (
                <LibraryCard
                  key={entry.id}
                  entry={entry}
                  linkedResources={linkedResources}
                  linkedLearning={linkedLearning}
                  expanded={expandedIds.includes(entry.id)}
                  onToggleDetails={handleToggleDetails}
                  onEdit={handleStartEdit}
                  onDelete={setBookToDelete}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <FormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          resetForm()
        }}
        onSubmit={handleSubmit}
        title={editingBook ? 'Edit Book' : 'Add a Book'}
        submitLabel={editingBook ? 'Save Changes' : 'Add Book'}
      >
        {/* General (non-field) failures — API, network, or a hybrid target that
            could not be created. Deliberately INSIDE the dialog: a role=alert
            rendered behind the modal is invisible exactly when it matters, and a
            network failure is never dressed up as a field error. */}
        {formAlert && (
          <div
            role="alert"
            className="rounded-lg border border-destructive-soft bg-destructive-soft/20 p-3"
          >
            <p className="text-body-small text-foreground">{formAlert}</p>
            <p className="text-caption text-muted-foreground">
              {editingBook
                ? 'Your book and its existing links were saved. Adjust the details above and save again to retry.'
                : 'Your book was saved. Open it from your shelf to finish linking.'}
            </p>
          </div>
        )}
        {linkPending && (
          <p role="status" className="text-body-small text-muted-foreground">
            Creating the linked items… this book is already saved.
          </p>
        )}
        {/* Keyed by the dialog session so every Add/Edit starts from the same
            clean state. Without this the dialog content instance is reused and
            the Resources/Learning disclosures would silently stay expanded from
            the previous dialog — violating "closed by default". */}
        <LibraryEntryForm
          key={formSession}
          title={form.title}
          author={form.author}
          status={form.status}
          progress={form.progress}
          currentPages={form.currentPages}
          totalPages={form.totalPages}
          rating={form.rating}
          notes={form.notes}
          quotes={form.quotes}
          progressMode={progressMode}
          relatedResourceIds={form.relatedResourceIds}
          relatedLearningIds={form.relatedLearningIds}
          resources={resources}
          learning={learning}
          isEdit={!!editingBook}
          alsoResource={form.alsoResource}
          resourceUrl={form.resourceUrl}
          alsoLearning={form.alsoLearning}
          linkPending={linkPending}
          errors={errors}
          onTitleChange={(value) => setField('title', value)}
          onAuthorChange={(value) => setField('author', value)}
          onStatusChange={handleStatusChange}
          onProgressModeChange={handleProgressModeChange}
          onProgressChange={(value) => setField('progress', value)}
          onCurrentPagesChange={(value) => setField('currentPages', value)}
          onTotalPagesChange={(value) => setField('totalPages', value)}
          onRatingChange={(value) => setField('rating', value)}
          onNotesChange={(value) => setField('notes', value)}
          onQuotesChange={(value) => setField('quotes', value)}
          onToggleResource={handleToggleResource}
          onToggleLearning={handleToggleLearning}
          onToggleAlsoResource={() => setField('alsoResource', !form.alsoResource)}
          onResourceUrlChange={(value) => setField('resourceUrl', value)}
          onToggleAlsoLearning={() => setField('alsoLearning', !form.alsoLearning)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Book"
        message="Are you sure you want to delete this book from your library? This action cannot be undone. Linked resources and learning goals are not affected."
      />
    </article>
  )
}
