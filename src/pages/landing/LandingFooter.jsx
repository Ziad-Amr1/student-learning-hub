import { Link } from 'react-router-dom'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import './LandingFooter.css'

export default function LandingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="landing-footer">
      <Container className="landing-footer__inner">
        <Link to="/" className="landing-footer__brand" aria-label="Huby — home">
          {LANDING.brand}
          <span aria-hidden="true">.</span>
        </Link>
        <p className="landing-footer__note text-caption">
          © {year} {LANDING.tagline} · {LANDING.footer.note}
        </p>
      </Container>
    </footer>
  )
}
