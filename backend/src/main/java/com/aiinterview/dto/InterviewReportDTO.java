package com.aiinterview.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InterviewReportDTO {
    private Long interviewId;
    private String jobRole;
    private String techStack;
    private String difficulty;
    private Double overallScore;
    private String overallFeedback;
    private Double behavioralAvg;
    private Double technicalAvg;
    private Double codingAvg;
    private List<QuestionResultDTO> questionResults;
}
