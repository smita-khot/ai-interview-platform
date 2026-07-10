package com.aiinterview.service;

import com.aiinterview.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Wraps Google Gemini's generateContent REST API.
 * Free API key: https://aistudio.google.com/app/apikey
 */
@Service
public class AiService {

    @Value("${app.ai.gemini.api-key}")
    private String apiKey;

    @Value("${app.ai.gemini.model}")
    private String model;

    @Value("${app.ai.gemini.base-url}")
    private String baseUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    public List<GeneratedQuestion> generateQuestions(String jobRole, String techStack,
                                                      String difficulty, int numQuestions) {
        String prompt = """
            You are an expert technical interviewer. Generate exactly %d interview questions
            for a candidate applying for the role "%s" with tech stack "%s" at "%s" difficulty.

            Mix question types: roughly 30%% BEHAVIORAL (soft skills, past experience),
            40%% TECHNICAL (concept/knowledge questions about the tech stack),
            and 30%% CODING (a coding problem to solve, described in words).

            Respond with ONLY a raw JSON array (no markdown, no code fences, no commentary),
            where each element looks like:
            {"questionText": "...", "type": "BEHAVIORAL|TECHNICAL|CODING"}
            """.formatted(numQuestions, jobRole, techStack, difficulty);

        String raw = callGemini(prompt);
        String json = extractJson(raw, "[");

        try {
            JsonNode arr = mapper.readTree(json);
            List<GeneratedQuestion> questions = new ArrayList<>();
            for (JsonNode node : arr) {
                GeneratedQuestion q = new GeneratedQuestion();
                q.setQuestionText(node.get("questionText").asText());
                q.setType(node.get("type").asText().toUpperCase());
                questions.add(q);
            }
            if (questions.isEmpty()) throw new RuntimeException("Empty question list");
            return questions;
        } catch (Exception e) {
            return fallbackQuestions(numQuestions);
        }
    }

    public EvaluationResult evaluateAnswer(String questionText, String type, String answerText) {
        String prompt = """
            You are an expert interviewer grading a candidate's answer.

            Question type: %s
            Question: "%s"
            Candidate's answer: "%s"

            Grade the answer on a scale of 0-10 (score can have one decimal place).
            Give short, specific, constructive feedback (2-3 sentences) and one concrete
            improvement tip (1-2 sentences). If the answer is empty or "I don't know",
            score it low and encourage the candidate.

            Respond with ONLY raw JSON (no markdown, no code fences), in this exact shape:
            {"score": 7.5, "feedback": "...", "improvementTip": "..."}
            """.formatted(type, questionText, answerText == null ? "" : answerText);

        String raw = callGemini(prompt);
        String json = extractJson(raw, "{");

        try {
            JsonNode node = mapper.readTree(json);
            EvaluationResult result = new EvaluationResult();
            result.setScore(node.get("score").asDouble());
            result.setFeedback(node.get("feedback").asText());
            result.setImprovementTip(node.get("improvementTip").asText());
            return result;
        } catch (Exception e) {
            EvaluationResult fallback = new EvaluationResult();
            fallback.setScore(5.0);
            fallback.setFeedback("We couldn't automatically grade this answer right now, but it has been recorded.");
            fallback.setImprovementTip("Try to structure your answer with a clear example (Situation, Task, Action, Result).");
            return fallback;
        }
    }

    public String generateOverallFeedback(String jobRole, double overallScore, String questionSummaries) {
        String prompt = """
            You are an interview coach. A candidate just finished a mock interview for
            the role "%s" and scored %.1f/10 overall.

            Here is a summary of each question and how they did:
            %s

            Write a short (4-6 sentence), encouraging but honest overall performance
            summary, highlighting 1-2 strengths and 1-2 concrete areas to improve
            before their real interview. Respond with plain text only, no JSON, no markdown.
            """.formatted(jobRole, overallScore, questionSummaries);

        String raw = callGemini(prompt);
        return raw == null || raw.isBlank()
                ? "Great effort completing the interview! Review the per-question feedback below to see where you can improve."
                : raw.trim();
    }

    // ---------------------------------------------------------------

    private String callGemini(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(
                "GEMINI_API_KEY is not configured on the server. Get a free key at https://aistudio.google.com/app/apikey and set it as an environment variable.",
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }

        try {
            String url = baseUrl + "/" + model + ":generateContent?key=" + apiKey;

            String requestBody = mapper.writeValueAsString(new Object() {
                public final Object[] contents = new Object[]{
                    new Object() {
                        public final Object[] parts = new Object[]{
                            new Object() {
                                public final String text = prompt;
                            }
                        };
                    }
                };
                public final Object generationConfig = new Object() {
                    public final double temperature = 0.7;
                };
            });

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(60))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new ApiException("AI provider error (" + response.statusCode() + "): " + response.body(),
                        HttpStatus.BAD_GATEWAY);
            }

            JsonNode root = mapper.readTree(response.body());
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

        } catch (ApiException ae) {
            throw ae;
        } catch (Exception e) {
            throw new ApiException("Failed to reach AI provider: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    /** Gemini sometimes wraps JSON in ```json fences despite instructions - strip them. */
    private String extractJson(String raw, String startChar) {
        if (raw == null) return startChar.equals("[") ? "[]" : "{}";
        String cleaned = raw.replaceAll("```json", "").replaceAll("```", "").trim();
        int start = cleaned.indexOf(startChar);
        int end = startChar.equals("[") ? cleaned.lastIndexOf("]") : cleaned.lastIndexOf("}");
        if (start == -1 || end == -1 || end < start) return startChar.equals("[") ? "[]" : "{}";
        return cleaned.substring(start, end + 1);
    }

    private List<GeneratedQuestion> fallbackQuestions(int numQuestions) {
        List<GeneratedQuestion> defaults = new ArrayList<>();
        String[][] pool = {
            {"Tell me about a time you had to work under a tight deadline.", "BEHAVIORAL"},
            {"What is the difference between a process and a thread?", "TECHNICAL"},
            {"Write a function to reverse a linked list.", "CODING"},
            {"Describe a conflict you had with a teammate and how you resolved it.", "BEHAVIORAL"},
            {"Explain how indexing improves database query performance.", "TECHNICAL"},
            {"Given an array of integers, find two numbers that add up to a target sum.", "CODING"},
            {"What motivates you to work in this field?", "BEHAVIORAL"},
            {"Explain the difference between REST and GraphQL APIs.", "TECHNICAL"},
            {"Write a function to check if a string is a palindrome.", "CODING"},
            {"Tell me about a project you're proud of and your specific contribution.", "BEHAVIORAL"}
        };
        for (int i = 0; i < numQuestions; i++) {
            String[] item = pool[i % pool.length];
            defaults.add(new GeneratedQuestion(item[0], item[1]));
        }
        return defaults;
    }
}