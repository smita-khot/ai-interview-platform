package com.aiinterview.controller;

import com.aiinterview.dto.*;
import com.aiinterview.entity.User;
import com.aiinterview.repository.UserRepository;
import com.aiinterview.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    public InterviewController(InterviewService interviewService, UserRepository userRepository) {
        this.interviewService = interviewService;
        this.userRepository = userRepository;
    }

    @PostMapping("/start")
    public ResponseEntity<QuestionDTO> start(Authentication authentication,
                                              @Valid @RequestBody InterviewStartRequest request) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(interviewService.startInterview(user, request));
    }

    @PostMapping("/{interviewId}/answer")
    public ResponseEntity<FeedbackDTO> submitAnswer(Authentication authentication,
                                                     @PathVariable Long interviewId,
                                                     @Valid @RequestBody AnswerSubmitRequest request) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(interviewService.submitAnswer(user, interviewId, request));
    }

    @PostMapping("/{interviewId}/complete")
    public ResponseEntity<InterviewReportDTO> complete(Authentication authentication,
                                                        @PathVariable Long interviewId) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(interviewService.completeInterview(user, interviewId));
    }

    @GetMapping("/{interviewId}/report")
    public ResponseEntity<InterviewReportDTO> report(Authentication authentication,
                                                      @PathVariable Long interviewId) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(interviewService.getReport(user, interviewId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<InterviewSummaryDTO>> history(Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(interviewService.getHistory(user));
    }

    private User currentUser(Authentication authentication) {
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
