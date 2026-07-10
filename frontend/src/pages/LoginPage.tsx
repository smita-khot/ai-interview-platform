import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 font-body">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display font-bold text-xl block text-center mb-8">
          Interview<span className="text-spotlight">IQ</span>
        </Link>

        <div className="bg-ink-soft border border-ink-line rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold mb-1 text-paper">Welcome back</h1>
          <p className="text-paper-muted text-sm mb-6">Log in to continue practicing.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-paper-muted block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ink border border-ink-line rounded-lg px-4 py-2.5 text-paper focus:outline-none focus:border-spotlight transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm text-paper-muted block mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink border border-ink-line rounded-lg px-4 py-2.5 text-paper focus:outline-none focus:border-spotlight transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-spotlight text-ink font-semibold py-2.5 rounded-lg hover:bg-spotlight-soft transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-paper-muted text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-spotlight hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
