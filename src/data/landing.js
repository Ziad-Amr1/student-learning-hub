export const LANDING = {
  brand: 'Huby',
  tagline: 'Your Personal Hub for Students',

  headerCta: { label: 'Enter the Hub', to: '/dashboard' },

  hero: {
    title: 'Your Personal Hub for Students',
    description:
      'Tasks, notes, resources, and progress — organized in one calm place, so your energy goes into learning, not searching.',
    primaryCta: { label: 'Enter the Hub', to: '/dashboard' },
    secondaryCta: { label: 'See what’s inside', href: '#features' },
    previewLabel: 'Huby workspace preview',
  },

  valueStatement:
    'Huby gathers your whole learning life into one personal workspace — plan it, capture it, revisit it, and watch it add up.',

  features: {
    title: 'Everything a student juggles, in one place',
    items: [
      {
        id: 'tasks',
        icon: 'tasks',
        title: 'Tasks',
        description:
          'Capture assignments the moment they appear, then work through them with clear priorities instead of scattered reminders.',
      },
      {
        id: 'notes',
        icon: 'notes',
        title: 'Notes',
        description:
          'Keep lecture notes and your own ideas together, searchable and ready for exam season.',
      },
      {
        id: 'resources',
        icon: 'resources',
        title: 'Resources',
        description:
          'Save links, files, and references once — and actually find them again when you need them.',
      },
      {
        id: 'progress',
        icon: 'progress',
        title: 'Progress',
        description:
          'See courses and goals move forward, so motivation comes from evidence rather than guesswork.',
      },
    ],
  },

  studyLoop: {
    title: 'A calmer study loop',
    description:
      'Four small habits, one connected hub. Each step feeds the next.',
    steps: [
      {
        title: 'Plan',
        description: 'Turn deadlines and intentions into an honest task list.',
      },
      {
        title: 'Capture',
        description: 'Park notes and resources where future-you can find them.',
      },
      {
        title: 'Learn',
        description: 'Focus on the material — your hub holds the logistics.',
      },
      {
        title: 'Track',
        description: 'Close the loop by marking progress and seeing momentum.',
      },
    ],
  },

  about: {
    title: 'Built around how studying actually feels',
    body: 'Student life is messy: five courses, a dozen deadlines, ideas everywhere. Huby is a quiet daily companion that keeps the logistics tidy so you can focus on learning — personal by design, with everything stored right in your browser.',
    previewLabel: 'Huby illustration',
  },

  closingCta: {
    title: 'Ready to give your studies a home?',
    action: { label: 'Get Started', to: '/dashboard' },
  },

  footer: {
    note: 'Built by the Huby team',
    productLinks: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Tasks', to: '/tasks' },
      { label: 'Notes', to: '/notes' },
      { label: 'Resources', to: '/resources' },
    ],
    exploreLinks: [
      { label: 'Features', href: '#features' },
      { label: 'Study loop', href: '#study-loop' },
      { label: 'About', href: '#about' },
    ],
  },
}
