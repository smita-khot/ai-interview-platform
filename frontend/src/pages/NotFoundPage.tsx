import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ink text-paper font-body flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl font-bold text-spotlight">404</p>
      <h1 className="font-display text-xl font-semibold">Page not found</h1>
      <p className="text-paper-muted max-w-sm">
        The page you're looking for doesn't exist, or the link might be broken.
      </p>
      <Link
        to="/"
        className="mt-2 bg-spotlight text-ink font-semibold px-6 py-2.5 rounded-lg hover:bg-spotlight-soft transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
