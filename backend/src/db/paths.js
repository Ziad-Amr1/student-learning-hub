import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(CURRENT_DIR, '../../../')

// Development default: <project>/backend/data/huby.db — outside tracked source
// (see root .gitignore → backend/data/). Packaged-desktop app-data paths are a
// later phase; HUBY_DB_PATH overrides in any environment.
export const DEFAULT_DB_PATH = resolve(PROJECT_ROOT, 'backend', 'data', 'huby.db')

export function resolveDbPath() {
  const override = process.env.HUBY_DB_PATH
  return override ? resolve(override) : DEFAULT_DB_PATH
}

export function ensureDbDir(path) {
  mkdirSync(dirname(path), { recursive: true })
}