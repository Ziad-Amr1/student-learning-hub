import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'

export default function AboutSection() {
  const { about } = LANDING
  return (
    <section
      className="border-y border-border bg-surface-muted py-16"
      aria-labelledby="about-title"
    >
      <Container className="max-w-[58ch]">
        <h2 id="about-title">{about.title}</h2>
        <p className="mt-4 text-body-small text-muted-foreground">{about.body}</p>
      </Container>
    </section>
  )
}
