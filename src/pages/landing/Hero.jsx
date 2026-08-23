import { Link } from 'react-router-dom'
import { ArrowDown } from 'lucide-react'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import Button from '../../components/ui/Button'
import './Hero.css'

export default function Hero() {
  const { hero } = LANDING
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Container className="hero__inner">
        <p className="hero__kicker text-caption">{LANDING.brand}</p>
        <h1 id="hero-title" className="hero__title text-display">
          {hero.title}
        </h1>
        <p className="hero__description text-body-small">{hero.description}</p>
        <div className="hero__actions">
          <Button as={Link} to={hero.primaryCta.to} size="lg">
            {hero.primaryCta.label}
          </Button>
          <Button
            as="a"
            href={hero.secondaryCta.href}
            variant="ghost"
            size="lg"
            className="hero__secondary"
          >
            {hero.secondaryCta.label}
            <ArrowDown className="hero__secondary-icon" aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </section>
  )
}
