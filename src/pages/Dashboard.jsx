import PageHeader from '../components/layout/PageHeader'
import { getGreeting } from '../utils/greeting'
import { useTasks } from '../hooks/useTasks'
import { normalizeTaskStatus } from '../utils/taskStatus'
import { STATUS_VISUALS } from '../constants/cardStatus'
import { CircleCheckBig, CircleDashed, CircleDot, ListTodo } from 'lucide-react'
import StatCard from './dashboard/StatCard'
import QuickActions from './dashboard/QuickActions'
import RecentTasks from './dashboard/RecentTasks'
import LearningProgress from './dashboard/LearningProgress'

export default function Dashboard() {
  const { tasks } = useTasks()
  const total = tasks.length
  const stats = [
    { label: 'Total tasks', value: total, Icon: ListTodo },
    {
      label: 'Unstarted',
      value: tasks.filter((task) => normalizeTaskStatus(task.status) === 'unstarted').length,
      Icon: CircleDashed,
    },
    {
      label: 'In progress',
      value: tasks.filter((task) => task.status === 'in-progress').length,
      badge: { label: 'active', variant: STATUS_VISUALS['in-progress'].badgeVariant },
      Icon: CircleDot,
    },
    {
      label: 'Completed',
      value: tasks.filter((task) => task.status === 'done').length,
      badge: { label: 'keep going', variant: STATUS_VISUALS.done.badgeVariant },
      Icon: CircleCheckBig,
    },
  ]

  return (
    <div className="flex flex-col gap-(--layout-section-gap)">
      <div className="flex flex-col gap-(--space-6)">
        <PageHeader
          title={`${getGreeting()}!`}
          description="Your learning at a glance."
        />
        <QuickActions />
      </div>
      <section aria-label="Task statistics">
        <h2 className="sr-only">Task statistics</h2>
        <div className="grid gap-(--layout-card-gap) sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>
      <section
        aria-label="Recent tasks and learning progress"
        className="grid gap-(--layout-card-gap) lg:grid-cols-5"
      >
        <h2 className="sr-only">Recent activity</h2>
        <RecentTasks className="lg:col-span-3" />
        <LearningProgress className="lg:col-span-2" />
      </section>
    </div>
  )
}
