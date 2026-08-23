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
import './FeatureGrid.css'

const FEATURE_ICONS = {
  tasks: ListTodo,
  notes: NotebookPen,
  resources: Library,
  progress: ChartNoAxesColumn,
}

export default function FeatureGrid() {
  const { features } = LANDING
  return (
    <section id="features" className="features" aria-labelledby="features-title">
      <Container>
        <h2 id="features-title" className="features__title">
          {features.title}
        </h2>
        <div className="features__grid">
          {features.items.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon]
            return (
              <Card key={feature.id} className="features__card">
                <CardHeader>
                  <span className="features__icon" aria-hidden="true">
                    <Icon />
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
