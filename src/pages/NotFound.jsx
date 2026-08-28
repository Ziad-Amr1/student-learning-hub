import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <>
      <a
        className="absolute -top-full left-2 z-(--z-skip-link) py-2 px-4 bg-primary text-primary-foreground rounded-md no-underline font-medium focus:top-2"
        href="#main-content"
      >
        Skip to content
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <p className="text-display text-primary">404</p>
        <h1>Page not found</h1>
        <p className="text-body-small">
          The page you are looking for does not exist or has moved.
        </p>
        <Button as={Link} to="/">
          Back to home
        </Button>
      </main>
    </>
  )
}
