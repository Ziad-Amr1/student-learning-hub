import { Link } from 'react-router-dom'
import { BookOpen, Library, ListTodo, NotebookPen } from 'lucide-react'
import Button from '../../components/ui/Button'

const ACTIONS = [
  { to: '/tasks', label: 'Tasks', Icon: ListTodo },
  { to: '/notes', label: 'Notes', Icon: NotebookPen },
  { to: '/resources', label: 'Resources', Icon: Library },
  { to: '/learning', label: 'Learning', Icon: BookOpen },
]

export default function QuickActions({ className }) {
  return (
    <nav aria-label="Quick actions" className={className}>
      <div className="flex flex-wrap gap-3">
        {ACTIONS.map(({ to, label, Icon }) => (
          <Button key={to} as={Link} to={to} variant="secondary">
            <Icon className="h-(--icon-md) w-(--icon-md)" aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>
    </nav>
  )
}
