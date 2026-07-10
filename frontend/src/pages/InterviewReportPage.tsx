import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { interviewApi } from '../api/interview'
import { InterviewReport } from '../types'

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-ink-soft border border-ink-line rounded-xl p-4 text-center">
      <p className="text-xs text-paper-muted mb-1">{label}</p>
      <p className="font-display text-xl font-bold text-signal">{value.toFixed(1)}</p>
    </div>
  )
}

export default function InterviewReportPage() {
  const { interviewId } = useParams()
  const [report, setReport] = useState<InterviewReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!interviewId) return
    interviewApi
      .getReport(Number(interviewId))
      .then(setReport)
      .catch(() => setError('Could not load this report.'))
      .finally(() => setLoading(false))
  }, [interviewId])

  if (loading) {
    return <div className="min-h-screen bg-ink text-paper-muted flex items-center justify-center">Loading report...</div>
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-ink text-paper flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || 'Report not found.'}</p>
        <Link to="/dashboard" className="text-spotlight hover:underline">Back to dashboard</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink text-paper font-body px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-sm text-paper-muted hover:text-paper mb-6 inline-block">
          ← Back to dashboard
        </Link>

        <div className="bg-ink-soft border border-ink-line rounded-2xl p-8 text-center mb-6">
          <p className="text-paper-muted mb-1">{report.jobRole} · {report.techStack} · {report.difficulty}</p>
          <p className="font-display text-5xl font-bold text-spotlight my-4">
            {report.overallScore.toFixed(1)}<span className="text-2xl text-paper-muted">/10</span>
          </p>
          <p className="text-paper leading-relaxed max-w-lg mx-auto">{report.overallFeedback}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <ScorePill label="Behavioral" value={report.behavioralAvg} />
          <ScorePill label="Technical" value={report.technicalAvg} />
          <ScorePill label="Coding" value={report.codingAvg} />
        </div>

        <h2 className="font-display text-lg font-bold mb-4">Question by question</h2>
        <div className="space-y-4">
          {report.questionResults.map((q, i) => (
            <div key={i} className="bg-ink-soft border border-ink-line rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-spotlight">{q.type}</span>
                <span className="text-signal font-semibold">{q.score.toFixed(1)}/10</span>
              </div>
              <p className="text-paper mb-2">{q.questionText}</p>
              <p className="text-sm text-paper-muted italic mb-3">"{q.answerText}"</p>
              <p className="text-sm text-paper-muted">{q.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
