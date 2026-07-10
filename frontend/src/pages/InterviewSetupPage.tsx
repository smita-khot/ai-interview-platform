import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { interviewApi } from '../api/interview'

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']

export default function InterviewSetupPage() {
  const [jobRole, setJobRole] = useState('')
  const [techStack, setTechStack] = useState('')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [numQuestions, setNumQuestions] = useState(6)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const firstQuestion = await interviewApi.start({ jobRole, techStack, difficulty, numQuestions })
      // The session page (Day 15) will read the interview + first question from here
      navigate(`/interview/${firstQuestion.interviewId}`, { state: { firstQuestion } })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not start the interview. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-paper font-body px-4 py-10">
      <div className="max-w-lg mx-auto">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-paper-muted hover:text-paper mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <h1 className="font-display text-2xl font-bold mb-1">Set up your interview</h1>
        <p className="text-paper-muted text-sm mb-8">
          The AI will generate a mix of behavioral, technical, and coding questions based on this.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-ink-soft border border-ink-line rounded-2xl p-6">
          <div>
            <label className="text-sm text-paper-muted block mb-1.5">Target job role</label>
            <input
              type="text"
              required
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Backend Developer"
              className="w-full bg-ink border border-ink-line rounded-lg px-4 py-2.5 text-paper focus:outline-none focus:border-spotlight transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-paper-muted block mb-1.5">Tech stack</label>
            <input
              type="text"
              required
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g. Java, Spring Boot, PostgreSQL"
              className="w-full bg-ink border border-ink-line rounded-lg px-4 py-2.5 text-paper focus:outline-none focus:border-spotlight transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-paper-muted block mb-1.5">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                    difficulty === d
                      ? 'bg-spotlight text-ink border-spotlight'
                      : 'bg-ink border-ink-line text-paper-muted hover:border-spotlight/40'
                  }`}
                >
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-paper-muted block mb-1.5">
              Number of questions: <span className="text-paper">{numQuestions}</span>
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-spotlight"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-spotlight text-ink font-semibold py-3 rounded-lg hover:bg-spotlight-soft transition-colors disabled:opacity-50"
          >
            <Sparkles size={18} />
            {loading ? 'Generating your questions...' : 'Start interview'}
          </button>
        </form>
      </div>
    </div>
  )
}
