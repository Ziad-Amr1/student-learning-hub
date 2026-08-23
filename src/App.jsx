import { Link, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Resources from './pages/Resources'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function HomePlaceholder() {
  return (
    <main>
      <h1>Huby</h1>
      <p>Your personal hub for students.</p>
      <p>
        The public landing page arrives in Sprint 02.5.{' '}
        <Link to="/dashboard">Go to your hub</Link>
      </p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePlaceholder />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
