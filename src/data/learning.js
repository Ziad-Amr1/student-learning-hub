// Seed learning-entry data — first-run defaults for
// useLocalStorage('student-hub:learning') (Sprint 07.6).
// Shape: docs/DATA_MODEL.md → LearningEntry. Keeps the historical
// LearningProgress id/title/category/progress/hours/updatedAt fields so the
// Dashboard + Profile widgets render unchanged, and adds the Sprint 07.6
// status/relationship/timestamp fields. relatedNotes/relatedResources hold
// IDs only (referencing the notes/resources seeds) — see DATA_MODEL.md §6.

export const LEARNING_ENTRIES = [
  {
    id: 'c21a84f9-3e67-4b50-a8d2-96f0b17ce534',
    title: 'The Odin Project — React path',
    category: 'course',
    status: 'in-progress',
    progress: 62,
    targetHours: 120,
    completedHours: 74,
    relatedNotes: [],
    relatedResources: ['e1f3a5b7-9c24-4d86-a0e2-3f4c5d6e7f80'],
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-22T20:00:00.000Z',
    startedAt: '2026-08-01T09:00:00.000Z',
    completedAt: null,
  },
  {
    id: '58d3f7b2-90ae-4c15-8b46-e2d97a60cf18',
    title: 'TechMaster Web Development Bootcamp',
    category: 'course',
    status: 'in-progress',
    progress: 48,
    targetHours: 200,
    completedHours: 96,
    relatedNotes: [
      'a3f1c8e2-7b44-4d91-b5e6-1a2c3d4e5f60',
      'd8e0f2a4-6b13-4c78-9d5e-7f8a9b0c1d2e',
    ],
    relatedResources: [
      'a3b5c7d9-1e46-4f08-c2a4-5b6c7d8e9f02',
      'f2a4b6c8-0d35-4e97-b1f3-4a5b6c7d8e91',
    ],
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-23T12:10:00.000Z',
    startedAt: '2026-08-02T09:00:00.000Z',
    completedAt: null,
  },
  {
    id: 'af06e5c4-72d1-4938-b9a5-30cd48e21b77',
    title: 'Clean Code',
    category: 'book',
    status: 'in-progress',
    progress: 35,
    relatedNotes: [],
    relatedResources: [],
    createdAt: '2026-08-04T10:00:00.000Z',
    updatedAt: '2026-08-19T21:35:00.000Z',
    startedAt: '2026-08-04T10:00:00.000Z',
    completedAt: null,
  },
  {
    id: '6b92d1a0-4f58-42e7-83cd-91ab05fe6d40',
    title: 'JavaScript Algorithms Practice',
    category: 'practice',
    status: 'in-progress',
    progress: 80,
    targetHours: 40,
    completedHours: 32,
    relatedNotes: [],
    relatedResources: ['a3b5c7d9-1e46-4f08-c2a4-5b6c7d8e9f02'],
    createdAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-24T08:40:00.000Z',
    startedAt: '2026-08-05T10:00:00.000Z',
    completedAt: null,
  },
]