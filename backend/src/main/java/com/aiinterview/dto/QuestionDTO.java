package com.aiinterview.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionDTO {
    private Long id;
    private Long interviewId;
    private String questionText;
    private String type;
    private Integer orderIndex;
    private Integer totalQuestions;
}
