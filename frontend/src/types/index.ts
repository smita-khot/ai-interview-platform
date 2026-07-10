// These mirror the backend DTOs exactly (see backend/.../dto/*.java)
// Keeping them in sync means TypeScript catches mistakes at compile time
// instead of you discovering a typo at runtime.

export interface InterviewSummary {
  id: number
  jobRole: string
  techStack: string
  difficulty: string
  status: 'IN_PROGRESS' | 'COMPLETED'
  overallScore: number | null
  createdAt: string
}

export interface Question {
  id: number
  interviewId: number
  questionText: string
  type: 'BEHAVIORAL' | 'TECHNICAL' | 'CODING'
  orderIndex: number
  totalQuestions: number
}

export interface Feedback {
  score: number
  feedback: string
  improvementTip: string
  hasNextQuestion: boolean
  nextQuestion: Question | null
}

export interface QuestionResult {
  questionText: string
  type: string
  answerText: string
  score: number
  feedback: string
  improvementTip: string
}

export interface InterviewReport {
  interviewId: number
  jobRole: string
  techStack: string
  difficulty: string
  overallScore: number
  overallFeedback: string
  behavioralAvg: number
  technicalAvg: number
  codingAvg: number
  questionResults: QuestionResult[]
}
