import PageHeader from '../components/layout/PageHeader'
import './Resources.css'

export default function Resources() {
  return (
    <article>
      <PageHeader
        title="Resources"
        description="Your saved learning resources."
      />
      <p className="page-stub__note text-body-small">
        The resource library arrives in Sprint 06.
      </p>
    </article>
  )
}
