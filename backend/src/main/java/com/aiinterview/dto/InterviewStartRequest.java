package com.aiinterview.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InterviewStartRequest {
    @NotBlank
    private String jobRole;       // e.g. "Backend Developer"

    @NotBlank
    private String techStack;     // e.g. "Java, Spring Boot, PostgreSQL"

    @NotBlank
    private String difficulty;    // EASY, MEDIUM, HARD

    @Min(3) @Max(10)
    private int numQuestions = 6;
}
