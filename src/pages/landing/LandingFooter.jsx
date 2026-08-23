import { Link } from 'react-router-dom'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'

export default function LandingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-surface py-8">
      <Container className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between sm:gap-4">
        <Link
          to="/"
          className="font-bold text-foreground no-underline"
          aria-label="Huby — home"
        >
          {LANDING.brand}
          <span aria-hidden="true">.</span>
        </Link>
        <p className="text-caption text-center text-muted-foreground">
          © {year} {LANDING.tagline} · {LANDING.footer.note}
        </p>
      </Container>
    </footer>
  )
}
