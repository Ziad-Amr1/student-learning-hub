// Seed note data — Sprint 05 Notes CRUD.
// Shape: docs/DATA_MODEL.md → Note.

export const NOTES = [
  {
    id: 'a3f1c8e2-7b44-4d91-b5e6-1a2c3d4e5f60',
    title: 'React Router quick reference',
    content:
      'NavLink gets aria-current="page" automatically. Use <Routes> to define route trees. Nested routes use <Outlet /> in the parent.',
    category: 'React',
    pinned: true,
    createdAt: '2026-08-20T09:00:00.000Z',
    updatedAt: '2026-08-22T18:30:00.000Z',
  },
  {
    id: 'b7d2e4f6-3c89-4a15-9e0f-2b3c4d5e6f71',
    title: 'CSS Grid vs Flexbox decision tree',
    content:
      'Use Flexbox for one-dimensional layouts (row OR column). Use Grid for two-dimensional layouts (rows AND columns). When unsure, start with Flexbox — it covers 90% of layout needs.',
    category: 'CSS',
    pinned: false,
    createdAt: '2026-08-21T14:20:00.000Z',
    updatedAt: '2026-08-21T14:20:00.000Z',
  },
  {
    id: 'c5a9b1d3-8e27-4f06-a4c8-9d0e1f2a3b4c',
    title: 'Accessibility checklist',
    content:
      '1. All images have alt text.\n2. Form inputs have visible labels.\n3. Color is never the sole indicator of state.\n4. Keyboard can reach all interactive elements.\n5. Focus ring is visible.',
    category: 'Accessibility',
    pinned: false,
    createdAt: '2026-08-22T10:05:00.000Z',
    updatedAt: '2026-08-23T08:15:00.000Z',
  },
  {
    id: 'd8e0f2a4-6b13-4c78-9d5e-7f8a9b0c1d2e',
    title: 'Git branching strategy',
    content:
      'main = always deployable. feature/* branches off main, merges back via PR. Keep commits atomic and messages conventional (feat:, fix:, docs:).',
    category: 'Git',
    pinned: false,
    createdAt: '2026-08-19T16:45:00.000Z',
    updatedAt: '2026-08-19T16:45:00.000Z',
  },
]
