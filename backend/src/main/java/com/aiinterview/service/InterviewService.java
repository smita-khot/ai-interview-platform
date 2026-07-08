package com.aiinterview.service;

import com.aiinterview.dto.*;
import com.aiinterview.entity.*;
import com.aiinterview.exception.ApiException;
import com.aiinterview.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final AiService aiService;

    public InterviewService(InterviewRepository interviewRepository, QuestionRepository questionRepository,
                             AnswerRepository answerRepository, AiService aiService) {
        this.interviewRepository = interviewRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.aiService = aiService;
    }

    @Transactional
    public QuestionDTO startInterview(User user, InterviewStartRequest request) {
        Interview interview = Interview.builder()
                .user(user)
                .jobRole(request.getJobRole())
                .techStack(request.getTechStack())
                .difficulty(request.getDifficulty().toUpperCase())
                .status("IN_PROGRESS")
                .build();
        interview = interviewRepository.save(interview);

        List<GeneratedQuestion> generated = aiService.generateQuestions(
                request.getJobRole(), request.getTechStack(),
                request.getDifficulty(), request.getNumQuestions());

        int order = 0;
        for (GeneratedQuestion gq : generated) {
            Question q = Question.builder()
                    .interview(interview)
                    .questionText(gq.getQuestionText())
                    .type(gq.getType())
                    .orderIndex(order++)
                    .build();
            questionRepository.save(q);
        }

        Question first = questionRepository.findByInterviewIdOrderByOrderIndexAsc(interview.getId()).get(0);
        int total = generated.size();

        return QuestionDTO.builder()
                .id(first.getId())
                .interviewId(interview.getId())
                .questionText(first.getQuestionText())
                .type(first.getType())
                .orderIndex(first.getOrderIndex())
                .totalQuestions(total)
                .build();
    }

    @Transactional
    public FeedbackDTO submitAnswer(User user, Long interviewId, AnswerSubmitRequest request) {
        Interview interview = getOwnedInterview(user, interviewId);

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ApiException("Question not found.", HttpStatus.NOT_FOUND));

        if (!question.getInterview().getId().equals(interviewId)) {
            throw new ApiException("Question does not belong to this interview.", HttpStatus.BAD_REQUEST);
        }

        EvaluationResult evaluation = aiService.evaluateAnswer(
                question.getQuestionText(), question.getType(), request.getAnswerText());

        Answer answer = Answer.builder()
                .question(question)
                .answerText(request.getAnswerText())
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .aiScore(evaluation.getScore())
                .aiFeedback(evaluation.getFeedback())
                .aiImprovementTip(evaluation.getImprovementTip())
                .build();
        answerRepository.save(answer);

        List<Question> allQuestions = questionRepository.findByInterviewIdOrderByOrderIndexAsc(interviewId);
        Question next = allQuestions.stream()
                .filter(q -> q.getOrderIndex() > question.getOrderIndex())
                .findFirst()
                .orElse(null);

        FeedbackDTO.FeedbackDTOBuilder builder = FeedbackDTO.builder()
                .score(evaluation.getScore())
                .feedback(evaluation.getFeedback())
                .improvementTip(evaluation.getImprovementTip())
                .hasNextQuestion(next != null);

        if (next != null) {
            builder.nextQuestion(QuestionDTO.builder()
                    .id(next.getId())
                    .interviewId(interviewId)
                    .questionText(next.getQuestionText())
                    .type(next.getType())
                    .orderIndex(next.getOrderIndex())
                    .totalQuestions(allQuestions.size())
                    .build());
        }

        return builder.build();
    }

    @Transactional
    public InterviewReportDTO completeInterview(User user, Long interviewId) {
        Interview interview = getOwnedInterview(user, interviewId);
        List<Question> questions = questionRepository.findByInterviewIdOrderByOrderIndexAsc(interviewId);

        List<QuestionResultDTO> results = questions.stream().map(q -> {
            Answer a = q.getAnswer();
            return QuestionResultDTO.builder()
                    .questionText(q.getQuestionText())
                    .type(q.getType())
                    .answerText(a != null ? a.getAnswerText() : "")
                    .score(a != null ? a.getAiScore() : 0.0)
                    .feedback(a != null ? a.getAiFeedback() : "Not answered.")
                    .improvementTip(a != null ? a.getAiImprovementTip() : "Try to answer every question, even partially.")
                    .build();
        }).collect(Collectors.toList());

        double overall = results.stream().mapToDouble(QuestionResultDTO::getScore).average().orElse(0.0);
        double behavioralAvg = avgByType(results, "BEHAVIORAL");
        double technicalAvg = avgByType(results, "TECHNICAL");
        double codingAvg = avgByType(results, "CODING");

        String summaryForAi = results.stream()
                .map(r -> "- [" + r.getType() + "] Score " + r.getScore() + "/10: " + r.getFeedback())
                .collect(Collectors.joining("\n"));

        String overallFeedback = aiService.generateOverallFeedback(interview.getJobRole(), overall, summaryForAi);

        interview.setStatus("COMPLETED");
        interview.setOverallScore(Math.round(overall * 10.0) / 10.0);
        interview.setOverallFeedback(overallFeedback);
        interview.setCompletedAt(LocalDateTime.now());
        interviewRepository.save(interview);

        return InterviewReportDTO.builder()
                .interviewId(interview.getId())
                .jobRole(interview.getJobRole())
                .techStack(interview.getTechStack())
                .difficulty(interview.getDifficulty())
                .overallScore(interview.getOverallScore())
                .overallFeedback(overallFeedback)
                .behavioralAvg(behavioralAvg)
                .technicalAvg(technicalAvg)
                .codingAvg(codingAvg)
                .questionResults(results)
                .build();
    }

    public InterviewReportDTO getReport(User user, Long interviewId) {
        Interview interview = getOwnedInterview(user, interviewId);
        List<Question> questions = questionRepository.findByInterviewIdOrderByOrderIndexAsc(interviewId);

        List<QuestionResultDTO> results = questions.stream().map(q -> {
            Answer a = q.getAnswer();
            return QuestionResultDTO.builder()
                    .questionText(q.getQuestionText())
                    .type(q.getType())
                    .answerText(a != null ? a.getAnswerText() : "")
                    .score(a != null ? a.getAiScore() : 0.0)
                    .feedback(a != null ? a.getAiFeedback() : "Not answered.")
                    .improvementTip(a != null ? a.getAiImprovementTip() : "")
                    .build();
        }).collect(Collectors.toList());

        return InterviewReportDTO.builder()
                .interviewId(interview.getId())
                .jobRole(interview.getJobRole())
                .techStack(interview.getTechStack())
                .difficulty(interview.getDifficulty())
                .overallScore(interview.getOverallScore())
                .overallFeedback(interview.getOverallFeedback())
                .behavioralAvg(avgByType(results, "BEHAVIORAL"))
                .technicalAvg(avgByType(results, "TECHNICAL"))
                .codingAvg(avgByType(results, "CODING"))
                .questionResults(results)
                .build();
    }

    public List<InterviewSummaryDTO> getHistory(User user) {
        return interviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(i -> InterviewSummaryDTO.builder()
                        .id(i.getId())
                        .jobRole(i.getJobRole())
                        .techStack(i.getTechStack())
                        .difficulty(i.getDifficulty())
                        .status(i.getStatus())
                        .overallScore(i.getOverallScore())
                        .createdAt(i.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------

    private Interview getOwnedInterview(User user, Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ApiException("Interview not found.", HttpStatus.NOT_FOUND));
        if (!interview.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have access to this interview.", HttpStatus.FORBIDDEN);
        }
        return interview;
    }

    private double avgByType(List<QuestionResultDTO> results, String type) {
        return results.stream()
                .filter(r -> r.getType().equalsIgnoreCase(type))
                .mapToDouble(QuestionResultDTO::getScore)
                .average()
                .orElse(0.0);
    }
}
