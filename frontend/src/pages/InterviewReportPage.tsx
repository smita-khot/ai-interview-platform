import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { interviewApi } from '../api/interview'
import { InterviewReport } from '../types'

const TYPE_COLORS: Record<string, string> = {
  BEHAVIORAL: '#F2B807', // spotlight
  TECHNICAL: '#5EEAD4',  // signal
  CODING: '#FFD966',     // spotlight-soft
}

// Recharts renders its own tooltip DOM - we style it inline to match our dark theme,
// since Tailwind classes don't reach into Recharts' internal tooltip markup.
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-soft border border-ink-line rounded-lg px-3 py-2 text-sm">
      <p className="text-paper-muted mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.value.toFixed(1)}/10</p>
      ))}
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

  const radarData = [
    { category: 'Behavioral', score: report.behavioralAvg, fullMark: 10 },
    { category: 'Technical', score: report.technicalAvg, fullMark: 10 },
    { category: 'Coding', score: report.codingAvg, fullMark: 10 },
  ]

  const perQuestionData = report.questionResults.map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.score,
    type: q.type,
  }))

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

        {/* Category breakdown - radar chart */}
        <div className="bg-ink-soft border border-ink-line rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg font-bold mb-2">Skill breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#22252F" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#9497A3', fontSize: 13 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fill: '#9497A3', fontSize: 11 }} />
                <Radar
                  dataKey="score"
                  stroke="#F2B807"
                  fill="#F2B807"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-question scores - bar chart */}
        <div className="bg-ink-soft border border-ink-line rounded-2xl p-6 mb-8">
          <h2 className="font-display text-lg font-bold mb-2">Score by question</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perQuestionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22252F" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#9497A3', fontSize: 12 }} axisLine={{ stroke: '#22252F' }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9497A3', fontSize: 12 }} axisLine={{ stroke: '#22252F' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#22252F', opacity: 0.4 }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {perQuestionData.map((entry, i) => (
                    <Cell key={i} fill={TYPE_COLORS[entry.type] ?? '#F2B807'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 justify-center text-xs text-paper-muted">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
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
