// SQLite schema — the v1 initial schema covers the five application-data
// domains, and the migration list tracks forward-only schema changes.
// The DB layer is the only place SQL lives: Models/Controllers/Routes remain
// SQL-free and reach storage exclusively through the Store seam
// (data/store.js). Column names equal model field names 1:1 (DATA_MODEL.md);
// JSON-array model fields are stored as JSON TEXT and round-tripped by the
// Store (see JSON_COLUMNS).

export const TABLES = ['tasks', 'notes', 'resources', 'learning', 'library', 'profile']

// table → JSON-array columns the Store must serialize/deserialize. Only model
// fields that ARE arrays appear here; every other column is scalar.
export const JSON_COLUMNS = {
  notes: ['tags'],
  learning: ['relatedNotes', 'relatedResources'],
  library: ['quotes', 'relatedResourceIds', 'relatedLearningIds'],
  profile: ['skills'],
}

const INITIAL_SCHEMA_SQL = [
  `
  CREATE TABLE tasks (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority    TEXT NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('low', 'medium', 'high')),
    status      TEXT NOT NULL DEFAULT 'unstarted'
                  CHECK (status IN ('unstarted', 'in-progress', 'deferred', 'done', 'cancelled')),
    dueDate     TEXT,
    createdAt   TEXT NOT NULL
  )
  `,
  `
  CREATE TABLE notes (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    category   TEXT,
    pinned     INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
    createdAt  TEXT NOT NULL,
    updatedAt  TEXT NOT NULL
  )
  `,
  `
  CREATE TABLE resources (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    url         TEXT NOT NULL CHECK (url LIKE 'http://%' OR url LIKE 'https://%'),
    category    TEXT NOT NULL
                  CHECK (category IN ('article', 'video', 'course', 'book', 'tool', 'other')),
    description TEXT,
    pinned      INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
    createdAt   TEXT NOT NULL
  )
  `,
  `
  CREATE TABLE learning (
    id               TEXT PRIMARY KEY,
    title            TEXT NOT NULL,
    category         TEXT NOT NULL
                      CHECK (category IN ('course', 'book', 'practice', 'video', 'topic')),
    status           TEXT NOT NULL
                      CHECK (status IN ('not-started', 'in-progress', 'paused', 'completed')),
    progress         INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    pinned           INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
    targetHours      REAL,
    completedHours   REAL,
    totalPages       INTEGER,
    videoMinutes     INTEGER,
    relatedNotes     TEXT NOT NULL DEFAULT '[]',
    relatedResources TEXT NOT NULL DEFAULT '[]',
    startedAt        TEXT,
    completedAt      TEXT,
    createdAt        TEXT NOT NULL,
    updatedAt        TEXT NOT NULL,
    CHECK (status != 'completed' OR progress = 100),
    CHECK (status != 'completed' OR completedAt IS NOT NULL)
  )
  `,
  `
  CREATE TABLE profile (
    id         TEXT PRIMARY KEY CHECK (id = 'profile'),
    name       TEXT NOT NULL,
    avatarUrl  TEXT,
    university TEXT,
    major      TEXT,
    bio        TEXT,
    skills     TEXT NOT NULL DEFAULT '[]'
  )
  `,
]

export const MIGRATIONS = [
  {
    id: 1,
    name: 'create_initial_domains',
    up: (db) => {
      for (const statement of INITIAL_SCHEMA_SQL) {
        db.exec(statement)
      }
    },
  },
  {
    // Application metadata (key/value). Hosts the legacy JSON → SQLite
    // migration-completion marker — the schema-owned home for the backend's
    // persistent migration state (see db/legacyMigration.js).
    id: 2,
    name: 'create_app_meta',
    up: (db) => {
      db.exec(`
        CREATE TABLE app_meta (
          key   TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `)
    },
  },
  {
    // My Library book domain (added 2026-09-27). A brand-new array
    // domain with NO legacy JSON source, so it ships as a standalone
    // forward-only migration (migration v3) rather than an
    // INITIAL_SCHEMA_SQL table. CHECKs mirror exactly what the Library model
    // guarantees: status enum, progress 0-100, rating 0-5, finished => 100,
    // and a finishedAt on the ending states (finished / dnf). No min-length
    // CHECKs — presence/trim validation is Model-owned (same rule as v1).
    id: 3,
    name: 'create_library',
    up: (db) => {
      db.exec(`
        CREATE TABLE library (
          id                 TEXT PRIMARY KEY,
          title              TEXT NOT NULL,
          author             TEXT,
          status             TEXT NOT NULL DEFAULT 'want-to-read'
                               CHECK (status IN ('want-to-read', 'reading', 'finished', 'dnf')),
          progress           INTEGER NOT NULL DEFAULT 0
                               CHECK (progress BETWEEN 0 AND 100),
          rating             INTEGER CHECK (rating BETWEEN 0 AND 5),
          notes              TEXT,
          quotes             TEXT NOT NULL DEFAULT '[]',
          relatedResourceIds TEXT NOT NULL DEFAULT '[]',
          relatedLearningIds TEXT NOT NULL DEFAULT '[]',
          startedAt          TEXT,
          finishedAt         TEXT,
          createdAt          TEXT NOT NULL,
          updatedAt          TEXT NOT NULL,
          CHECK (status != 'finished' OR progress = 100),
          CHECK (status != 'finished' OR finishedAt IS NOT NULL),
          CHECK (status != 'dnf' OR finishedAt IS NOT NULL)
        )
      `)
    },
  },
  {
    // Reading-progress page support (added 2026-09-27, phase-0 decision 1).
    // `progress` REMAINS the single source of truth (0-100); this adds only the
    // optional page count a percentage is derived against, so the UI can offer
    // "X of Y pages" without a second stored progress value. Forward-only
    // ALTER: nullable, no data rewrite, existing rows read back as NULL
    // ("no page tracking") and their `progress` is untouched. The CHECK mirrors
    // what the Library model guarantees: a page count is a positive integer.
    // `currentPages` is NEVER persisted - it is derived from progress x
    // totalPages. Learning status/progress mirroring was evaluated in the same
    // audit and is explicitly DEFERRED (no linkedLearningEntryId column).
    id: 4,
    name: 'add_library_total_pages',
    up: (db) => {
      db.exec(`
        ALTER TABLE library
          ADD COLUMN totalPages INTEGER
            CHECK (totalPages IS NULL OR (typeof(totalPages) = 'integer' AND totalPages > 0))
      `)
    },
  },
  {
    // Task category (added 2026-09-28, Sprint 11 phase 2). Free-text label
    // following the Note.category precedent: the Model owns trimming and the
    // "" -> absent rule, so the column carries NO vocabulary CHECK (a DB must
    // never reject a value the Model accepts, and the vocabulary is the user's).
    // Forward-only ALTER: nullable, no DEFAULT, no data rewrite — existing rows
    // read back as NULL ("no category") and are deliberately NOT backfilled.
    id: 5,
    name: 'add_task_category',
    up: (db) => {
      db.exec(`
        ALTER TABLE tasks
          ADD COLUMN category TEXT
      `)
    },
  },
  {
    // Note tags (added 2026-09-28, Sprint 11 phase 4). JSON-array column —
    // same precedent as Library quotes / Learning relatedNotes: no vocabulary
    // CHECK, normalization (trim → lowercase → drop empty → dedupe, first-seen
    // order) is Model-owned. NOT NULL DEFAULT '[]' means pre-v6 notes read back
    // as `[]` ("no tags") and are deliberately NOT backfilled.
    id: 6,
    name: 'add_note_tags',
    up: (db) => {
      db.exec(`
        ALTER TABLE notes
          ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'
      `)
    },
  },
]