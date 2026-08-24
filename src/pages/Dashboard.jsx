import PageHeader from '../components/layout/PageHeader'
import { TASKS } from '../data/tasks'
import StatCard from './dashboard/StatCard'
import QuickActions from './dashboard/QuickActions'

export default function Dashboard() {
  const total = TASKS.length
  const stats = [
    { label: 'Total tasks', value: total },
    {
      label: 'To do',
      value: TASKS.filter((task) => task.status === 'todo').length,
    },
    {
      label: 'In progress',
      value: TASKS.filter((task) => task.status === 'in-progress').length,
      badge: { label: 'active', variant: 'info' },
    },
    {
      label: 'Completed',
      value: TASKS.filter((task) => task.status === 'done').length,
      badge: { label: 'keep going', variant: 'success' },
    },
  ]

  return (
    <div className="flex flex-col gap-(--layout-section-gap)">
      <PageHeader
        title="Dashboard"
        description="Your learning at a glance."
      />
      <QuickActions />
      <section aria-label="Task statistics">
        <h2 className="sr-only">Task statistics</h2>
        <div className="grid gap-(--layout-card-gap) sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>
    </div>
  )
}
