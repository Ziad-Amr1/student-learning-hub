import { Link } from 'react-router-dom'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'

const LINK_CLASSES =
  'text-body-small text-muted-foreground no-underline transition-colors duration-150 ease-standard hover:text-foreground'

function FooterLink({ link }) {
  return link.to ? (
    <Link to={link.to} className={LINK_CLASSES}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className={LINK_CLASSES}>
      {link.label}
    </a>
  )
}

function LinkGroup({ label, links }) {
  return (
    <nav aria-label={label} className="flex flex-col items-start gap-3">
      <p className="text-label uppercase tracking-widest text-foreground">
        {label}
      </p>
      <ul className="flex list-none flex-col items-start gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLink link={link} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function LandingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-surface py-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-3">
            <Link
              to="/"
              className="text-(--font-size-h3) font-bold text-foreground no-underline"
              aria-label="Huby — home"
            >
              {LANDING.brand}
              <span className="text-primary" aria-hidden="true">
                .
              </span>
            </Link>
            <p className="max-w-[36ch] text-body-small text-muted-foreground">
              {LANDING.tagline}
            </p>
          </div>
          <LinkGroup label="Product" links={LANDING.footer.productLinks} />
          <LinkGroup label="Explore" links={LANDING.footer.exploreLinks} />
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-muted-foreground">
            © {year} {LANDING.brand} · {LANDING.tagline}
          </p>
          <p className="text-caption text-muted-foreground">
            {LANDING.footer.note}
          </p>
        </div>
      </Container>
    </footer>
  )
}
