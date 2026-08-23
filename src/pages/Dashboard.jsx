import PageHeader from '../components/layout/PageHeader'
import './Dashboard.css'

export default function Dashboard() {
  return (
    <article>
      <PageHeader
        title="Dashboard"
        description="Your learning at a glance."
      />
      <p className="page-stub__note text-body-small">
        Dashboard content arrives in Sprint 03.
      </p>
    </article>
  )
}
