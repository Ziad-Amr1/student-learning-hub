import PageHeader from '../components/layout/PageHeader'
import { getGreeting } from '../utils/greeting'
import useLocalStorage from '../hooks/useLocalStorage'
import { TASKS } from '../data/tasks'
import { CircleCheckBig, CircleDashed, CircleDot, ListTodo } from 'lucide-react'
import StatCard from './dashboard/StatCard'
import QuickActions from './dashboard/QuickActions'
import RecentTasks from './dashboard/RecentTasks'
import LearningProgress from './dashboard/LearningProgress'

export default function Dashboard() {
  const [tasks] = useLocalStorage('student-hub:tasks', () => [...TASKS])
  const total = tasks.length
  const stats = [
    { label: 'Total tasks', value: total, Icon: ListTodo },
    {
      label: 'To do',
      value: tasks.filter((task) => task.status === 'todo').length,
      Icon: CircleDashed,
    },
    {
      label: 'In progress',
      value: tasks.filter((task) => task.status === 'in-progress').length,
      badge: { label: 'active', variant: 'info' },
      Icon: CircleDot,
    },
    {
      label: 'Completed',
      value: tasks.filter((task) => task.status === 'done').length,
      badge: { label: 'keep going', variant: 'success' },
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
