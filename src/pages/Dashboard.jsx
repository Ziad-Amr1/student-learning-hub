import PageHeader from '../components/layout/PageHeader'

export default function Dashboard() {
  return (
    <article>
      <PageHeader
        title="Dashboard"
        description="Your learning at a glance."
      />
      <p className="text-body-small text-muted-foreground">
        Dashboard content arrives in Sprint 03.
      </p>
    </article>
  )
}
