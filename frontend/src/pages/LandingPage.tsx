import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, Mic, Code2, BarChart3, ArrowRight, CheckCircle2, Github,
} from 'lucide-react'

// ---- Signature hero element: a simulated live interview transcript ----
const TRANSCRIPT = [
  { role: 'ai', text: "Explain the difference between REQUIRED and REQUIRES_NEW transaction propagation." },
  { role: 'user', text: "REQUIRED joins the existing transaction... REQUIRES_NEW suspends it and starts a new one." },
  { role: 'score', text: '9.5 / 10 — Excellent, precise explanation.' },
]

function LiveTranscript() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    if (visibleLines >= TRANSCRIPT.length) return
    const currentText = TRANSCRIPT[visibleLines].text
    if (charCount < currentText.length) {
      const t = setTimeout(() => setCharCount((c) => c + 1), 14)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setVisibleLines((v) => v + 1)
      setCharCount(0)
    }, 700)
    return () => clearTimeout(t)
  }, [charCount, visibleLines])

  return (
    <div className="bg-ink-soft border border-ink-line rounded-2xl p-6 font-mono text-sm shadow-2xl shadow-black/40 w-full max-w-lg">
      <div className="flex gap-1.5 mb-4">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-spotlight/70" />
        <span className="w-3 h-3 rounded-full bg-signal/70" />
      </div>
      <div className="space-y-3 min-h-[160px]">
        {TRANSCRIPT.slice(0, visibleLines + 1).map((line, i) => {
          const isCurrent = i === visibleLines
          const text = isCurrent ? line.text.slice(0, charCount) : line.text
          if (line.role === 'score') {
            return (
              <div key={i} className="text-signal font-semibold pt-2 border-t border-ink-line">
                ✓ {text}
                {isCurrent && charCount < line.text.length && <span className="animate-blink">▍</span>}
              </div>
            )
          }
          return (
            <div key={i} className={line.role === 'ai' ? 'text-spotlight-soft' : 'text-paper'}>
              <span className="text-paper-muted">{line.role === 'ai' ? 'AI Interviewer: ' : 'You: '}</span>
              {text}
              {isCurrent && charCount < line.text.length && <span className="animate-blink">▍</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-generated questions',
    desc: 'Every session is tailored to your target role, tech stack, and difficulty — never the same interview twice.',
  },
  {
    icon: Mic,
    title: 'Speak or type your answers',
    desc: 'Practice like a real interview with voice input, or type if you prefer — your choice, every question.',
  },
  {
    icon: Code2,
    title: 'Real coding rounds',
    desc: 'A genuine code editor for technical problems, graded on correctness and best practice, not just output.',
  },
  {
    icon: BarChart3,
    title: 'Instant, honest scoring',
    desc: 'Every answer gets a 0-10 score with specific feedback and a concrete tip — no vague encouragement.',
  },
]

const STEPS = [
  { n: '01', title: 'Pick your target role', desc: 'Tell us the role, tech stack, and difficulty you want to practice.' },
  { n: '02', title: 'Take the interview', desc: 'Answer behavioral, technical, and coding questions — by voice or text.' },
  { n: '03', title: 'Get your report', desc: 'See your score, category breakdown, and exactly what to improve.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-paper font-body">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="font-display font-bold text-xl tracking-tight">
          Interview<span className="text-spotlight">IQ</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-paper-muted hover:text-paper transition-colors px-4 py-2">
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-spotlight text-ink font-semibold px-4 py-2 rounded-lg hover:bg-spotlight-soft transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-signal bg-signal/10 border border-signal/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-blink" />
            Free AI-powered mock interviews
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">
            Practice the interview <span className="text-spotlight">before</span> it counts.
          </h1>
          <p className="text-paper-muted text-lg mb-8 max-w-md">
            An AI interviewer that asks real behavioral, technical, and coding
            questions for your target role — then tells you honestly how you did.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-spotlight text-ink font-semibold px-6 py-3 rounded-lg hover:bg-spotlight-soft transition-colors"
            >
              Start a mock interview <ArrowRight size={18} />
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-8 text-sm text-paper-muted">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-signal" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-signal" /> Instant feedback</span>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <LiveTranscript />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-ink-line">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Everything a real interview has</h2>
        <p className="text-paper-muted mb-10">Except the stakes.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-ink-soft border border-ink-line rounded-xl p-6 hover:border-spotlight/30 transition-colors">
              <Icon className="text-spotlight mb-4" size={24} />
              <h3 className="font-display font-semibold mb-2">{title}</h3>
              <p className="text-sm text-paper-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-ink-line">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="font-mono text-spotlight text-sm mb-3">{s.n}</div>
              <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-paper-muted text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-ink-line text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Ready to see where you stand?</h2>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-spotlight text-ink font-semibold px-8 py-3 rounded-lg hover:bg-spotlight-soft transition-colors"
        >
          Start your first interview <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-ink-line flex items-center justify-between text-sm text-paper-muted">
        <span>InterviewIQ — built with Spring Boot, React & Gemini AI</span>
        <a href="#" className="flex items-center gap-1.5 hover:text-paper transition-colors">
          <Github size={16} /> View source
        </a>
      </footer>
    </div>
  )
}
