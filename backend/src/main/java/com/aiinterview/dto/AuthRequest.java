package com.aiinterview.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AuthRequest {
    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;
}
