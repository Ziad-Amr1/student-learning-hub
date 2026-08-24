import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function StatCard({ label, value, badge, className }) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-body-small text-muted-foreground">{label}</p>
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
      </div>
      <p className="text-(--font-size-h3) font-bold leading-(--line-height-tight)">
        {value}
      </p>
    </Card>
  )
}
