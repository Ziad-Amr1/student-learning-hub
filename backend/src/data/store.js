import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url))

// LOW-LEVEL file-backed store. This is the ONLY module in the project that
// touches the filesystem / knows about JSON files. It is intentionally
// entity-agnostic: domain shape, defaults, and normalization live in the
// models, not here. Swapping JSON persistence for a real database later would
// only require replacing this one file's internals.
export class JsonStore {
  constructor(filename) {
    this.file = resolve(CURRENT_DIR, filename)
    if (!existsSync(this.file)) {
      mkdirSync(dirname(this.file), { recursive: true })
      writeFileSync(this.file, JSON.stringify([], null, 2), 'utf-8')
    }
  }

  readAll() {
    try {
      return JSON.parse(readFileSync(this.file, 'utf-8'))
    } catch {
      return []
    }
  }

  writeAll(records) {
    writeFileSync(this.file, JSON.stringify(records, null, 2), 'utf-8')
  }

  findAll() {
    return this.readAll()
  }

  findById(id) {
    return this.readAll().find((record) => String(record.id) === String(id)) || null
  }

  insert(record) {
    const all = this.readAll()
    all.push(record)
    this.writeAll(all)
    return record
  }

  update(id, patch) {
    const all = this.readAll()
    const index = all.findIndex((record) => String(record.id) === String(id))
    if (index === -1) return null
    all[index] = { ...all[index], ...patch, id: all[index].id }
    this.writeAll(all)
    return all[index]
  }

  remove(id) {
    const all = this.readAll()
    const index = all.findIndex((record) => String(record.id) === String(id))
    if (index === -1) return false
    all.splice(index, 1)
    this.writeAll(all)
    return true
  }
}

export function createStore(filename) {
  return new JsonStore(filename)
}
