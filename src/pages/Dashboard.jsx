import PageHeader from '../components/layout/PageHeader'
import QuickActions from './dashboard/QuickActions'

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-(--layout-section-gap)">
      <PageHeader
        title="Dashboard"
        description="Your learning at a glance."
      />
      <QuickActions />
    </div>
  )
}
