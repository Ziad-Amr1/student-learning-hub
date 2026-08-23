import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import './StudyLoop.css'

export default function StudyLoop() {
  const { studyLoop } = LANDING
  return (
    <section className="study-loop" aria-labelledby="study-loop-title">
      <Container>
        <h2 id="study-loop-title">{studyLoop.title}</h2>
        <p className="study-loop__description text-body-small">
          {studyLoop.description}
        </p>
        <ol className="study-loop__steps">
          {studyLoop.steps.map((step, index) => (
            <li key={step.title} className="study-loop__step">
              <span className="study-loop__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="study-loop__step-title">{step.title}</h3>
                <p className="study-loop__step-description text-body-small">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
