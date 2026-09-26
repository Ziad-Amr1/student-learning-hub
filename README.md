# Huby

**Your Personal Hub for Students** — a calm, modern, organized place to
manage your learning life in one workspace: tasks, notes, resources, and
learning progress, plus your own personal learning journey.

## Features

- **Dashboard** — stat cards, recent tasks, learning progress, and quick
  actions at a glance.
- **Tasks** — full task management with five statuses, sorting, and progress.
- **Notes** — write and manage personal notes.
- **Resources** — collect and pin study resources and links.
- **Learning** — track learning goals by type (course, book, practice,
  video, topic) with progress, pages, minutes, and pinning.
- **Profile** — edit your personal profile.
- **Landing page** — a public introduction to the app.

## Tech Stack

- **React 19** + **Vite 8** (JavaScript)
- **React Router** — single-page routing
- **Tailwind CSS v4** — CSS-first design tokens (`@theme` in
  `src/styles/app.css`)
- **Express** — minimal API backend (Phase D + SQLite foundation), the
  single source of truth for application data, persisting to a local
  **SQLite** database (`backend/data/huby.db`; `node:sqlite`, no new deps)
- **Local Storage** — browser-local UI preferences only; app data lives in
  the backend

## Getting Started

```bash
npm install
npm run dev
```

`npm run dev` (via `concurrently`) starts both the API server (Express on
`:5000`, `node --watch` auto-reload) and the Vite dev client. The web app is
served under the `/student-learning-hub/` base path; the API is a
JSON envelope at `/api` (health-check: `http://localhost:5000/api/health`).
On first boot the server creates the SQLite database `backend/data/huby.db`
(auto-created directory, gitignored; override the path with `HUBY_DB_PATH`),
then — before listening — migrates the legacy JSON domain files
(`backend/src/data/*.json`) into it in one crash-safe transaction
(originals are backed up to `backend/data/backups/<timestamp>/` and never
modified; a pristine install with no JSON starts normally with empty tables).
A skipped re-run (marker already set) changes nothing and creates no new
backup.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start both the API server and the dev client |
| `npm start` | Alias for `npm run dev` |
| `npm run client` | Start only the Vite dev client |
| `npm run server` | Start only the Express API server (`node --watch`) |
| `npm run build` | Build the production frontend bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the backend `node:test` suite (SQLite foundation, store, models, legacy JSON migration, API-level parity) |

Run the frontend alone with `npm run client` (expects the API elsewhere), and
the API alone with `npm run server`. Configure the API URL the browser calls
with `VITE_API_URL` (defaults to `http://localhost:5000/api`). Backend
settings (port, CORS origins) live in `backend/.env.example` / `backend/.env`.

## Project Structure

```
src/
  api/                Frontend HTTP client (thin wrapper + domain API modules)
  components/ui/      Shared, feature-agnostic UI primitives
  components/layout/  Shell & navigation (AppShell, Navbar, MobileNav…)
  pages/              Route-level pages and feature components
  data/               Seed/mock product data
  hooks/              Reusable stateful React logic (useRemote, useTasks…)
  utils/              Pure helpers
  constants/          Pure static constant maps
  styles/             Design tokens (single source of truth)
backend/
  server.js           Express entry point (db init → legacy JSON→SQLite migration → listen)
  src/app.js          App wiring (middleware, routes, error handling)
  src/routes/         Route definitions per domain
  src/controllers/    Request handling per domain
  src/models/         Data model + validation rules per domain
  src/data/store.js   SqliteStore — entity-agnostic persistence seam (only layer that touches SQL via db/*)
  src/data/legacyStore.js  Old JSON store, PRESERVED (not used by the live app; the migration reads the JSON via fs)
  src/db/             SQLite bootstrap: paths, init (DatabaseSync + WAL), schema (v1 DDL + v2 app_meta), migrations, legacyMigration (S2/S3)
  src/middleware/     Express middleware
  src/utils/          Shared helpers (id, ApiError…)
```

All backend source lives under `backend/` but uses the **root** package
(`node_modules`, `type: module`, `package-lock.json`) — the backend has no
package.json of its own. See `docs/sprints/PHASE_D_BACKEND.md` for the API
contract and architecture decisions.

