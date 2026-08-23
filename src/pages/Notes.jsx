import PageHeader from '../components/layout/PageHeader'
import './Notes.css'

export default function Notes() {
  return (
    <article>
      <PageHeader
        title="Notes"
        description="Capture and organize your notes."
      />
      <p className="page-stub__note text-body-small">
        Note-taking arrives in Sprint 05.
      </p>
    </article>
  )
}
