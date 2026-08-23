import PageHeader from '../components/layout/PageHeader'
import './Profile.css'

export default function Profile() {
  return (
    <article>
      <PageHeader
        title="Profile"
        description="Your personal learning profile."
      />
      <p className="page-stub__note text-body-small">
        Profile features arrive in Sprint 06.
      </p>
    </article>
  )
}
