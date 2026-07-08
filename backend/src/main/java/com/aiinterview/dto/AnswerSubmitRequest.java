package com.aiinterview.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AnswerSubmitRequest {
    @NotNull
    private Long questionId;

    private String answerText;

    private Integer timeTakenSeconds;
}
