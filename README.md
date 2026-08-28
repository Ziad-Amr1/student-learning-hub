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
- **Local Storage** — browser-local persistence (single-user, no backend)

## Getting Started

```bash
npm install
npm run dev
```

The dev server serves the app under the `/student-learning-hub/` base path.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
  components/ui/      Shared, feature-agnostic UI primitives
  components/layout/  Shell & navigation (AppShell, Navbar, MobileNav…)
  pages/              Route-level pages and feature components
  data/               Seed/mock product data
  hooks/              Reusable stateful React logic
  utils/              Pure helpers
  constants/          Pure static constant maps
  styles/             Design tokens (single source of truth)
```

