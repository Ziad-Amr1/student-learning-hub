import PageHeader from '../components/layout/PageHeader'

export default function Tasks() {
  return (
    <article>
      <PageHeader
        className="mb-(--layout-section-gap)"
        title="Tasks"
        description="Plan and track your study tasks."
      />
      <p className="text-body-small text-muted-foreground">
        Task management arrives in Sprint 04.
      </p>
    </article>
  )
}
