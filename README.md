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
- **Express** — minimal JSON API backend (Phase D-1), the single source of
  truth for application data
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

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start both the API server and the dev client |
| `npm start` | Alias for `npm run dev` |
| `npm run client` | Start only the Vite dev client |
| `npm run server` | Start only the Express API server (`node --watch`) |
| `npm run build` | Build the production frontend bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

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
  hooks/              Reusable stateful React logic (useLocalStorage, useRemote, useTasks…)
  utils/              Pure helpers
  constants/          Pure static constant maps
  styles/             Design tokens (single source of truth)
backend/
  server.js           Express entry point
  src/app.js          App wiring (middleware, routes, error handling)
  src/routes/         Route definitions per domain
  src/controllers/    Request handling per domain
  src/models/         Data model + validation rules per domain
  src/data/           JSON-file store (only layer that touches the filesystem)
  src/data/seed/      First-run seed data
  src/middleware/     Express middleware
  src/utils/          Shared helpers (id, ApiError…)
```

All backend source lives under `backend/` but uses the **root** package
(`node_modules`, `type: module`, `package-lock.json`) — the backend has no
package.json of its own. See `docs/sprints/PHASE_D_BACKEND.md` for the API
contract and architecture decisions.

