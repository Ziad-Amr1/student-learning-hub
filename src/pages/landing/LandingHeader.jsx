import { Link } from 'react-router-dom'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import Button from '../../components/ui/Button'

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-(--z-nav) h-(--layout-navbar-height) border-b border-border bg-surface">
      <Container className="flex h-full items-center justify-between gap-4">
        <Link
          to="/"
          className="text-(--font-size-h4) font-bold text-foreground no-underline"
          aria-label="Huby — home"
        >
          {LANDING.brand}
          <span className="text-primary" aria-hidden="true">
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
