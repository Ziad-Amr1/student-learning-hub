import { Route, Routes } from 'react-router-dom'

function HomePlaceholder() {
  return (
    <main>
      <h1>Student Hub</h1>
      <p>Sprint 0 — project foundation. Routes will be added in upcoming sprints.</p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePlaceholder />} />
    </Routes>
  )
}
