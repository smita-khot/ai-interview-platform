package com.aiinterview.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InterviewSummaryDTO {
    private Long id;
    private String jobRole;
    private String techStack;
    private String difficulty;
    private String status;
    private Double overallScore;
    private LocalDateTime createdAt;
}
