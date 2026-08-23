import { Link } from 'react-router-dom'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import Button from '../../components/ui/Button'

export default function ClosingCta() {
  const { closingCta } = LANDING
  return (
    <section
      className="bg-primary py-16 text-surface"
      aria-labelledby="closing-cta-title"
    >
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 id="closing-cta-title" className="max-w-[24ch]">
          {closingCta.title}
        </h2>
        <Button as={Link} to={closingCta.action.to} variant="secondary" size="lg">
          {closingCta.action.label}
        </Button>
      </Container>
    </section>
  )
}
