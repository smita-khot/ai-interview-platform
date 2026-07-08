package com.aiinterview.service;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EvaluationResult {
    private double score;          // 0-10
    private String feedback;
    private String improvementTip;
}
