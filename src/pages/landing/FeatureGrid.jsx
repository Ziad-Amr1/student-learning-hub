import {
  ChartNoAxesColumn,
  Library,
  ListTodo,
  NotebookPen,
} from 'lucide-react'
import { LANDING } from '../../data/landing'
import Container from '../../components/layout/Container'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'

const FEATURE_ICONS = {
  tasks: ListTodo,
  notes: NotebookPen,
  resources: Library,
  progress: ChartNoAxesColumn,
}

export default function FeatureGrid() {
  const { features } = LANDING
  return (
    <section
      id="features"
      className="scroll-mt-(--layout-navbar-height) border-y border-border bg-surface-muted py-16"
      aria-labelledby="features-title"
    >
      <Container>
        <h2 id="features-title" className="mb-(--layout-section-gap) max-w-[28ch]">
          {features.title}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-(--layout-card-gap)">
          {features.items.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon]
            return (
              <Card key={feature.id}>
                <CardHeader className="gap-3">
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary-strong"
                    aria-hidden="true"
                  >
                    <Icon className="h-(--icon-lg) w-(--icon-lg)" />
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
