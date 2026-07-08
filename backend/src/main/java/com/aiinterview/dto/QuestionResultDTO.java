package com.aiinterview.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionResultDTO {
    private String questionText;
    private String type;
    private String answerText;
    private Double score;
    private String feedback;
    private String improvementTip;
}
