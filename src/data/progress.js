// Seed learning-progress data — Sprint 03 Dashboard (read-only).
// Shape: docs/DATA_MODEL.md → LearningProgress. `targetHours`/`completedHours`
// are optional; the book entry omits both to exercise conditional rendering.

export const LEARNING_PROGRESS = [
  {
    id: 'c21a84f9-3e67-4b50-a8d2-96f0b17ce534',
    title: 'The Odin Project — React path',
    category: 'course',
    progress: 62,
    targetHours: 120,
    completedHours: 74,
    updatedAt: '2026-08-22T20:00:00.000Z',
  },
  {
    id: '58d3f7b2-90ae-4c15-8b46-e2d97a60cf18',
    title: 'TechMaster Web Development Bootcamp',
    category: 'course',
    progress: 48,
    targetHours: 200,
    completedHours: 96,
    updatedAt: '2026-08-23T12:10:00.000Z',
  },
  {
    id: 'af06e5c4-72d1-4938-b9a5-30cd48e21b77',
    title: 'Clean Code',
    category: 'book',
    progress: 35,
    updatedAt: '2026-08-19T21:35:00.000Z',
  },
  {
    id: '6b92d1a0-4f58-42e7-83cd-91ab05fe6d40',
    title: 'JavaScript Algorithms Practice',
    category: 'practice',
    progress: 80,
    targetHours: 40,
    completedHours: 32,
    updatedAt: '2026-08-24T08:40:00.000Z',
  },
]
