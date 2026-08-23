import PageHeader from '../components/layout/PageHeader'
import './Tasks.css'

export default function Tasks() {
  return (
    <article>
      <PageHeader
        title="Tasks"
        description="Plan and track your study tasks."
      />
      <p className="page-stub__note text-body-small">
        Task management arrives in Sprint 04.
      </p>
    </article>
  )
}
