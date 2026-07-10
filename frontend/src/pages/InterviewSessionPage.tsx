import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { Loader2, Send, ArrowRight, CheckCircle2, Mic, MicOff } from 'lucide-react'
import { interviewApi } from '../api/interview'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { Question, Feedback } from '../types'

const TYPE_LABEL: Record<string, string> = {
  BEHAVIORAL: 'Behavioral',
  TECHNICAL: 'Technical',
  CODING: 'Coding',
}

const GRADING_MESSAGES = [
  'Reading your answer...',
  'Checking the technical details...',
  'Weighing strengths and gaps...',
  'Writing specific feedback...',
  'Almost done...',
]

export default function InterviewSessionPage() {
  const { interviewId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [question, setQuestion] = useState<Question | null>(
    (location.state as any)?.firstQuestion ?? null
  )
  const [answerText, setAnswerText] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState('')
  const [gradingMessageIndex, setGradingMessageIndex] = useState(0)

  const startTimeRef = useRef<number>(Date.now())

  const { isSupported: voiceSupported, isListening, interimText, startListening, stopListening } =
    useVoiceInput((finalChunk) => {
      setAnswerText((prev) => (prev ? `${prev} ${finalChunk}` : finalChunk))
    })

  // Reset the answer box + start a fresh timer whenever we move to a new question
  useEffect(() => {
    setAnswerText('')
    startTimeRef.current = Date.now()
    stopListening()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id])

  // While waiting on the AI to grade, cycle through reassuring messages
  // every 2.5s so the wait feels intentional instead of frozen.
  useEffect(() => {
    if (!submitting) {
      setGradingMessageIndex(0)
      return
    }
    const interval = setInterval(() => {
      setGradingMessageIndex((i) => Math.min(i + 1, GRADING_MESSAGES.length - 1))
    }, 2500)
    return () => clearInterval(interval)
  }, [submitting])

  if (!question) {
    return (
      <div className="min-h-screen bg-ink text-paper font-body flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-paper-muted max-w-md">
          We don't have this question loaded (probably from a page refresh — resuming
          an in-progress interview isn't supported yet). Please start a new interview.
        </p>
        <Link to="/dashboard" className="text-spotlight hover:underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const handleSubmitAnswer = async () => {
    if (!interviewId) return
    setError('')
    setSubmitting(true)
    const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)

    try {
      const result = await interviewApi.submitAnswer(
        Number(interviewId),
        question.id,
        answerText,
        timeTakenSeconds
      )
      setFeedback(result)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not submit your answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = async () => {
    if (!feedback) return

    if (feedback.hasNextQuestion && feedback.nextQuestion) {
      setQuestion(feedback.nextQuestion)
      setFeedback(null)
      return
    }

    // No more questions - complete the interview and go to the report
    if (!interviewId) return
    setFinishing(true)
    try {
      await interviewApi.complete(Number(interviewId))
      navigate(`/interview/${interviewId}/report`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not finalize the interview.')
      setFinishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-paper font-body px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 text-sm text-paper-muted">
          <span>Question {question.orderIndex + 1} of {question.totalQuestions}</span>
          <span className="font-mono text-spotlight">{TYPE_LABEL[question.type] ?? question.type}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-ink-soft rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-spotlight transition-all duration-500"
            style={{ width: `${((question.orderIndex + (feedback ? 1 : 0)) / question.totalQuestions) * 100}%` }}
          />
        </div>

        <div className="bg-ink-soft border border-ink-line rounded-2xl p-6 mb-6">
          <p className="text-lg leading-relaxed">{question.questionText}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {!feedback ? (
          <>
            <div className="relative">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder={
                  question.type === 'CODING'
                    ? 'Write your solution here (pseudocode or real code, both are fine)...'
                    : 'Type your answer here, or use the mic to speak it...'
                }
                rows={question.type === 'CODING' ? 10 : 6}
                className={`w-full bg-ink border border-ink-line rounded-xl px-4 py-3 pr-14 text-paper focus:outline-none focus:border-spotlight transition-colors resize-none ${
                  question.type === 'CODING' ? 'font-mono text-sm' : ''
                }`}
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  title={isListening ? 'Stop recording' : 'Speak your answer'}
                  className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : 'bg-ink-soft text-paper-muted hover:text-spotlight'
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}
            </div>
            {isListening && (
              <p className="text-xs text-signal font-mono mt-2">
                Listening... {interimText && <span className="text-paper-muted">"{interimText}"</span>}
              </p>
            )}
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || !answerText.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-spotlight text-ink font-semibold py-3 rounded-lg hover:bg-spotlight-soft transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> {GRADING_MESSAGES[gradingMessageIndex]}
                </>
              ) : (
                <>
                  <Send size={18} /> Submit answer
                </>
              )}
            </button>
          </>
        ) : (
          <div className="bg-ink-soft border border-signal/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-paper-muted">Your score</span>
              <span className="font-display text-2xl font-bold text-signal">{feedback.score.toFixed(1)}/10</span>
            </div>
            <p className="text-paper mb-4 leading-relaxed">{feedback.feedback}</p>
            <div className="bg-ink border border-ink-line rounded-lg p-4 mb-6">
              <p className="text-xs font-mono text-spotlight mb-1">IMPROVEMENT TIP</p>
              <p className="text-sm text-paper-muted leading-relaxed">{feedback.improvementTip}</p>
            </div>
            <button
              onClick={handleContinue}
              disabled={finishing}
              className="w-full flex items-center justify-center gap-2 bg-spotlight text-ink font-semibold py-3 rounded-lg hover:bg-spotlight-soft transition-colors disabled:opacity-50"
            >
              {finishing ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Finishing up...
                </>
              ) : feedback.hasNextQuestion ? (
                <>
                  Next question <ArrowRight size={18} />
                </>
              ) : (
                <>
                  See my report <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
