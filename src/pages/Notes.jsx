import PageHeader from '../components/layout/PageHeader'

export default function Notes() {
  return (
    <article className="flex flex-col gap-(--layout-section-gap)">
      <div className="flex flex-col gap-(--space-6)">
        <PageHeader
          title="Notes"
          description="Capture and organize your notes."
        />
        <p className="text-body-small text-muted-foreground">
          Note-taking arrives in Sprint 05.
        </p>
      </div>
    </article>
  )
}
