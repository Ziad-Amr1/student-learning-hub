// LOW-LEVEL SQLite-backed store. This is THE persistence seam: the only module
// Models reach for storage, and the only module that knows the database
// exists. The public surface is byte-compatible with the previous JSON store —
// findAll / findById / insert / update / remove, all synchronous — so Models,
// Controllers, Routes, and the frontend API are untouched.
//
// The store is entity-agnostic: domain shape, defaults, and normalization live
// in the models, not here. It maps one table to one domain; column names are
// the model field names; JSON-array model fields (see db/schema.js JSON_COLUMNS)
// are serialized to TEXT and deserialized back to JS arrays on read.
// SQL is confined to this module + the db layer (db/init.js, db/schema.js,
// db/migrations.js); parameterized statements are used for every value.
import { getDatabase } from '../db/init.js'
import { JSON_COLUMNS } from '../db/schema.js'

function toDbValue(value) {
  if (value === undefined || value === null) return null
  if (Array.isArray(value)) return JSON.stringify(value)
  if (typeof value === 'boolean') return value ? 1 : 0
  return value
}

export class SqliteStore {
  constructor(table) {
    this.table = table
    this.jsonColumns = JSON_COLUMNS[table] ?? []
  }

  get db() {
    return getDatabase()
  }

  decode(row) {
    if (!row) return row
    for (const column of this.jsonColumns) {
      const value = row[column]
      if (typeof value === 'string') {
        try {
          row[column] = JSON.parse(value)
        } catch {
          row[column] = []
        }
      }
    }
    return row
  }

  findAll() {
    return this.db
      .prepare(`SELECT * FROM "${this.table}" ORDER BY rowid`)
      .all()
      .map((row) => this.decode(row))
  }

  findById(id) {
    const row = this.db.prepare(`SELECT * FROM "${this.table}" WHERE "id" = ?`).get(id)
    return this.decode(row) ?? null
  }

  insert(record) {
    const keys = Object.keys(record)
    const values = keys.map((key) => toDbValue(record[key]))
    this.db
      .prepare(
        `INSERT INTO "${this.table}" (${keys.map((key) => `"${key}"`).join(', ')})
         VALUES (${keys.map(() => '?').join(', ')})`,
      )
      .run(...values)
    return record
  }

  update(id, record) {
    const keys = Object.keys(record).filter((key) => key !== 'id')
    const values = keys.map((key) => toDbValue(record[key]))
    const result = this.db
      .prepare(
        `UPDATE "${this.table}" SET ${keys.map((key) => `"${key}" = ?`).join(', ')}
         WHERE "id" = ?`,
      )
      .run(...values, id)
    if (result.changes === 0) return null
    return { ...record, id }
  }

  remove(id) {
    const result = this.db.prepare(`DELETE FROM "${this.table}" WHERE "id" = ?`).run(id)
    return result.changes > 0
  }
}

export function createStore(table) {
  return new SqliteStore(table)
}