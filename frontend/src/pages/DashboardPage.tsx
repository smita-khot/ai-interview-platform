import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, LogOut, Clock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { interviewApi } from '../api/interview'
import { InterviewSummary } from '../types'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [interviews, setInterviews] = useState<InterviewSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    interviewApi
      .getHistory()
      .then(setInterviews)
      .catch(() => setError('Could not load your interview history.'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-ink text-paper font-body">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="font-display font-bold text-xl">
          Interview<span className="text-spotlight">IQ</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-paper-muted hover:text-paper transition-colors"
        >
          <LogOut size={16} /> Log out
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-paper-muted text-sm mt-1">
              {interviews.length === 0
                ? "You haven't taken a mock interview yet."
                : `${interviews.length} interview${interviews.length === 1 ? '' : 's'} so far.`}
            </p>
          </div>
          <Link
            to="/interview/new"
            className="flex items-center gap-2 bg-spotlight text-ink font-semibold px-4 py-2.5 rounded-lg hover:bg-spotlight-soft transition-colors whitespace-nowrap"
          >
            <Plus size={18} /> New interview
          </Link>
        </div>

        {loading && <p className="text-paper-muted">Loading your history...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && interviews.length === 0 && (
          <div className="border border-dashed border-ink-line rounded-2xl p-12 text-center">
            <p className="text-paper-muted mb-4">No interviews yet — let's fix that.</p>
            <Link
              to="/interview/new"
              className="inline-flex items-center gap-2 bg-spotlight text-ink font-semibold px-5 py-2.5 rounded-lg hover:bg-spotlight-soft transition-colors"
            >
              <Plus size={18} /> Start your first interview
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {interviews.map((interview) => (
            <Link
              key={interview.id}
              to={
                interview.status === 'COMPLETED'
                  ? `/interview/${interview.id}/report`
                  : `/interview/${interview.id}`
              }
              className="flex items-center justify-between bg-ink-soft border border-ink-line rounded-xl px-5 py-4 hover:border-spotlight/30 transition-colors"
            >
              <div>
                <h3 className="font-display font-semibold">{interview.jobRole}</h3>
                <p className="text-sm text-paper-muted">{interview.techStack} · {interview.difficulty}</p>
              </div>
              <div className="flex items-center gap-4">
                {interview.status === 'COMPLETED' ? (
                  <span className="flex items-center gap-1.5 text-signal font-mono text-sm">
                    <CheckCircle2 size={16} /> {interview.overallScore?.toFixed(1)}/10
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-spotlight-soft text-sm">
                    <Clock size={16} /> In progress
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
