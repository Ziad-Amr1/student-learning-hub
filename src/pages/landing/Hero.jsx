import { Link } from 'react-router-dom'
import { ArrowDown } from 'lucide-react'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import Button from '../../components/ui/Button'

export default function Hero() {
  const { hero } = LANDING
  return (
    <section
      className="border-b border-border bg-primary-soft py-16 sm:py-20"
      aria-labelledby="hero-title"
    >
      <Container className="flex flex-col items-center gap-4 text-center">
        <p className="text-caption font-semibold uppercase text-primary-strong">
          {LANDING.brand}
        </p>
        <h1 id="hero-title" className="text-display max-w-[20ch]">
          {hero.title}
        </h1>
        <p className="max-w-[52ch] text-(--font-size-body) leading-(--line-height-small) text-muted-foreground">
          {hero.description}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button
            as={Link}
            to={hero.primaryCta.to}
            size="lg"
            className="flex-auto sm:flex-none"
          >
            {hero.primaryCta.label}
          </Button>
          <Button
            as="a"
            href={hero.secondaryCta.href}
            variant="ghost"
            size="lg"
            className="flex-auto hover:underline sm:flex-none"
          >
            {hero.secondaryCta.label}
            <ArrowDown className="h-(--icon-sm) w-(--icon-sm)" aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </section>
  )
}
