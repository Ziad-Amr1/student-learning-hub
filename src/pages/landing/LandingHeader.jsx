import { Link } from 'react-router-dom'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import Button from '../../components/ui/Button'
import './LandingHeader.css'

export default function LandingHeader() {
  return (
    <header className="landing-header">
      <Container className="landing-header__inner">
        <Link to="/" className="landing-header__brand" aria-label="Huby — home">
          {LANDING.brand}
          <span className="landing-header__brand-dot" aria-hidden="true">
            .
          </span>
        </Link>
        <Button as={Link} to={LANDING.headerCta.to} size="sm">
          {LANDING.headerCta.label}
        </Button>
      </Container>
    </header>
  )
}
