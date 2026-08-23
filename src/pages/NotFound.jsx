import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="not-found__code text-display">404</p>
      <h1>Page not found</h1>
      <p className="text-body-small">
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/" className="btn btn--primary btn--md">
        Back to home
      </Link>
    </main>
  )
}
