package com.aiinterview.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String answerText;

    private Integer timeTakenSeconds;

    private Double aiScore; // 0-10

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(columnDefinition = "TEXT")
    private String aiImprovementTip;
}
