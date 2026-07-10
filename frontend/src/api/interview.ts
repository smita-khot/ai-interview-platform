import { api } from './client'
import { InterviewSummary, Question, Feedback, InterviewReport } from '../types'

export interface StartInterviewPayload {
  jobRole: string
  techStack: string
  difficulty: string
  numQuestions: number
}

export const interviewApi = {
  getHistory: () => api.get<InterviewSummary[]>('/interview/history').then((r) => r.data),

  start: (payload: StartInterviewPayload) =>
    api.post<Question>('/interview/start', payload).then((r) => r.data),

  submitAnswer: (interviewId: number, questionId: number, answerText: string, timeTakenSeconds: number) =>
    api
      .post<Feedback>(`/interview/${interviewId}/answer`, { questionId, answerText, timeTakenSeconds })
      .then((r) => r.data),

  complete: (interviewId: number) =>
    api.post<InterviewReport>(`/interview/${interviewId}/complete`).then((r) => r.data),

  getReport: (interviewId: number) =>
    api.get<InterviewReport>(`/interview/${interviewId}/report`).then((r) => r.data),
}
