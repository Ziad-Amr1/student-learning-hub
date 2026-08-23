import { Link } from 'react-router-dom'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import Button from '../../components/ui/Button'
import './ClosingCta.css'

export default function ClosingCta() {
  const { closingCta } = LANDING
  return (
    <section className="closing-cta" aria-labelledby="closing-cta-title">
      <Container className="closing-cta__inner">
        <h2 id="closing-cta-title">{closingCta.title}</h2>
        <Button as={Link} to={closingCta.action.to} variant="secondary" size="lg">
          {closingCta.action.label}
        </Button>
      </Container>
    </section>
  )
}
