import PageHeader from '../components/layout/PageHeader'

export default function Profile() {
  return (
    <article>
      <PageHeader
        className="mb-(--layout-section-gap)"
        title="Profile"
        description="Your personal learning profile."
      />
      <p className="text-body-small text-muted-foreground">
        Profile features arrive in Sprint 06.
      </p>
    </article>
  )
}
