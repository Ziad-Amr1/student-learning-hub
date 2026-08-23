import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'

export default function ValueProps() {
  return (
    <section className="py-16" aria-labelledby="value-props-title">
      <Container>
        <h2
          id="value-props-title"
          className="max-w-[44ch] text-(--font-size-h3) leading-(--line-height-body) font-medium text-muted-foreground"
        >
          {LANDING.valueStatement}
        </h2>
      </Container>
    </section>
  )
}
