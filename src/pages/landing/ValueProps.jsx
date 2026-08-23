import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import './ValueProps.css'

export default function ValueProps() {
  return (
    <section className="value-props" aria-labelledby="value-props-title">
      <Container className="value-props__inner">
        <h2 id="value-props-title" className="value-props__statement">
          {LANDING.valueStatement}
        </h2>
      </Container>
    </section>
  )
}
