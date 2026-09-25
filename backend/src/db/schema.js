// SQLite schema — the v1 initial schema covers the five application-data
// domains, and the migration list tracks forward-only schema changes.
// The DB layer is the only place SQL lives: Models/Controllers/Routes remain
// SQL-free and reach storage exclusively through the Store seam
// (data/store.js). Column names equal model field names 1:1 (DATA_MODEL.md);
// JSON-array model fields are stored as JSON TEXT and round-tripped by the
// Store (see JSON_COLUMNS).

export const TABLES = ['tasks', 'notes', 'resources', 'learning', 'profile']

// table → JSON-array columns the Store must serialize/deserialize. Only model
// fields that ARE arrays appear here; every other column is scalar.
export const JSON_COLUMNS = {
  learning: ['relatedNotes', 'relatedResources'],
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
]