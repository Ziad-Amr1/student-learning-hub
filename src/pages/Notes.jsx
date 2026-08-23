import PageHeader from '../components/layout/PageHeader'

export default function Notes() {
  return (
    <article>
      <PageHeader
        title="Notes"
        description="Capture and organize your notes."
      />
      <p className="text-body-small text-muted-foreground">
        Note-taking arrives in Sprint 05.
      </p>
    </article>
  )
}
