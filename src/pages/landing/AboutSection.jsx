import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import './AboutSection.css'

export default function AboutSection() {
  const { about } = LANDING
  return (
    <section className="about" aria-labelledby="about-title">
      <Container className="about__inner">
        <h2 id="about-title">{about.title}</h2>
        <p className="about__body text-body-small">{about.body}</p>
      </Container>
    </section>
  )
}
