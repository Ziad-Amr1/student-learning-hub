import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'

export default function StudyLoop() {
  const { studyLoop } = LANDING
  return (
    <section className="py-16" aria-labelledby="study-loop-title">
      <Container>
        <h2 id="study-loop-title">{studyLoop.title}</h2>
        <p className="mt-3 max-w-[52ch] text-body-small text-muted-foreground">
          {studyLoop.description}
        </p>
        <ol className="mt-(--layout-section-gap) grid list-none grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-x-(--layout-card-gap) gap-y-8">
          {studyLoop.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary-strong"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="mb-1 text-(--font-size-body) font-semibold">
                  {step.title}
                </h3>
                <p className="text-body-small text-muted-foreground">
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
