package com.aiinterview.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeedbackDTO {
    private Double score;         // 0-10
    private String feedback;
    private String improvementTip;
    private Boolean hasNextQuestion;
    private QuestionDTO nextQuestion;
}
