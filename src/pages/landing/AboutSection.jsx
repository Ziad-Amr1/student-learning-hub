import { BookOpen } from 'lucide-react'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'

export default function AboutSection() {
  const { about } = LANDING
  return (
    <section
      id="about"
      className="scroll-mt-(--layout-navbar-height) border-y border-border bg-surface-muted py-16"
      aria-labelledby="about-title"
    >
      <Container className="grid gap-(--layout-section-gap) lg:grid-cols-2 lg:items-center">
        <div
          className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-input bg-surface shadow-sm"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary-strong">
              <BookOpen className="h-(--icon-lg) w-(--icon-lg)" />
            </span>
            <p className="text-body-small text-muted-foreground">
              {about.previewLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 id="about-title">{about.title}</h2>
          <p className="max-w-[52ch] text-body-small text-muted-foreground">
            {about.body}
          </p>
        </div>
      </Container>
    </section>
  )
}
