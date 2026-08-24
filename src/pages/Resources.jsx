import PageHeader from '../components/layout/PageHeader'

export default function Resources() {
  return (
    <article className="flex flex-col gap-(--layout-section-gap)">
      <PageHeader
        title="Resources"
        description="Your saved learning resources."
      />
      <p className="text-body-small text-muted-foreground">
        The resource library arrives in Sprint 06.
      </p>
    </article>
  )
}
