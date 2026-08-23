import { Link } from 'react-router-dom'
import { ArrowDown, LayoutDashboard } from 'lucide-react'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import Button from '../../components/ui/Button'

export default function Hero() {
  const { hero } = LANDING
  return (
    <section
      className="border-b border-border bg-primary-soft py-16 lg:py-20"
      aria-labelledby="hero-title"
    >
      <Container className="grid gap-(--layout-section-gap) lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col items-start gap-4">
          <p className="flex items-center gap-3 text-label font-semibold uppercase tracking-widest text-primary-strong">
            <span className="h-0.5 w-4 rounded-full bg-primary" aria-hidden="true" />
            {LANDING.brand}
          </p>
          <h1 id="hero-title" className="text-display max-w-[20ch]">
            {hero.title}
          </h1>
          <p className="max-w-[52ch] text-(--font-size-body) leading-(--line-height-small) text-muted-foreground">
            {hero.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button as={Link} to={hero.primaryCta.to} size="lg">
              {hero.primaryCta.label}
            </Button>
            <Button
              as="a"
              href={hero.secondaryCta.href}
              variant="outline"
              size="lg"
            >
              {hero.secondaryCta.label}
              <ArrowDown className="h-(--icon-sm) w-(--icon-sm)" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div
          className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-input bg-surface shadow-sm"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary-strong">
              <LayoutDashboard className="h-(--icon-lg) w-(--icon-lg)" />
            </span>
            <p className="text-body-small text-muted-foreground">
              {hero.previewLabel}
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
