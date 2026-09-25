// Forward-only schema migration runner. `schema_migrations` records applied
// migration ids; each migration runs in its own transaction (all-or-nothing).
// Applied migrations are never edited — schema evolution appends newer,
// higher-id migrations. A schema rollback is a file-restore concern
// (single-user local-first app), not the runner's job, so down-migrations
// are intentionally not modelled.

const MIGRATIONS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS schema_migrations (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL
)`

export function runMigrations(db, migrations) {
  db.exec(MIGRATIONS_TABLE_SQL)
  const applied = new Set(
    db.prepare('SELECT id FROM schema_migrations').all().map((row) => row.id),
  )
  const pending = [...migrations].sort((a, b) => a.id - b.id)
  for (const migration of pending) {
    if (applied.has(migration.id)) continue
    db.exec('BEGIN')
    try {
      migration.up(db)
      db.prepare('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)').run(
        migration.id,
        migration.name,
        new Date().toISOString(),
      )
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }
  return db
    .prepare('SELECT id, name, applied_at FROM schema_migrations ORDER BY id')
    .all()
}