package com.healthcare.manager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.manager.dto.AiPostVisitResult;
import com.healthcare.manager.dto.AiTriageResult;
import com.healthcare.manager.entity.UrgencyLevel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiAiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAiService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AiRateLimiterService aiRateLimiterService;

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-3.6-flash}")
    private String model;

    public GeminiAiService(RestTemplate restTemplate, ObjectMapper objectMapper, AiRateLimiterService aiRateLimiterService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.aiRateLimiterService = aiRateLimiterService;
    }

    /**
     * Pre-visit Symptom Triage Analysis using Gemini API (with rate limit protection)
     */
    public AiTriageResult analyzePreVisitSymptoms(String symptoms) {
        return analyzePreVisitSymptoms(symptoms, null);
    }

    /**
     * Pre-visit Symptom Triage Analysis with user-specific rate limit tracking
     */
    public AiTriageResult analyzePreVisitSymptoms(String symptoms, String userIdentifier) {
        if (symptoms == null || symptoms.isBlank()) {
            return new AiTriageResult(UrgencyLevel.LOW, "Routine consultation / Checkup", 
                    List.of("What is the primary reason for today's visit?", "Have you experienced any new symptoms recently?", "Are you currently taking any regular medications?"), true);
        }

        if (apiKey == null || apiKey.trim().isEmpty() || "your_gemini_api_key_here".equals(apiKey)) {
            logger.warn("Gemini API key is not configured. Using rule-based fallback triage.");
            aiRateLimiterService.recordFallbackCall();
            return generateFallbackTriage(symptoms);
        }

        // Rate Limit & Quota Check
        if (!aiRateLimiterService.tryAcquire(userIdentifier)) {
            logger.warn("AI Rate limit or daily quota reached. Switching to rule-based fallback triage.");
            aiRateLimiterService.recordFallbackCall();
            return generateFallbackTriage(symptoms);
        }

        try {
            String prompt = """
                You are an expert clinical triage assistant.
                Analyze these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor.
                Symptoms: %s

                You MUST return ONLY a valid JSON object strictly matching this schema with no markdown formatting or backticks:
                {
                  "urgency": "Low" | "Medium" | "High",
                  "chief_complaint": "one clear sentence describing primary complaint",
                  "suggested_questions": [
                    "Question 1 for doctor",
                    "Question 2 for doctor",
                    "Question 3 for doctor"
                  ]
                }
                """.formatted(symptoms.replace("\"", "\\\""));

            String rawResponse = callGeminiApi(prompt);
            AiTriageResult result = parseTriageResponse(rawResponse, symptoms);
            aiRateLimiterService.recordSuccessfulAiCall();
            return result;
        } catch (Exception e) {
            logger.error("Failed to execute Gemini AI symptom triage. Activating graceful degradation fallback: {}", e.getMessage());
            aiRateLimiterService.recordFallbackCall();
            return generateFallbackTriage(symptoms);
        }
    }

    /**
     * Post-visit Clinical Notes & Prescription Summary using Gemini API
     */
    public AiPostVisitResult generatePostVisitSummary(String clinicalNotes, String prescriptionSummary) {
        return generatePostVisitSummary(clinicalNotes, prescriptionSummary, null);
    }

    /**
     * Post-visit Clinical Notes & Prescription Summary with user-specific rate limit tracking
     */
    public AiPostVisitResult generatePostVisitSummary(String clinicalNotes, String prescriptionSummary, String userIdentifier) {
        String combinedNotes = (clinicalNotes != null ? clinicalNotes : "") + 
                (prescriptionSummary != null && !prescriptionSummary.isBlank() ? "\nPrescription Details: " + prescriptionSummary : "");

        if (combinedNotes.isBlank()) {
            AiPostVisitResult result = new AiPostVisitResult();
            result.setPatientFriendlySummary("No specific clinical notes were recorded for this consultation.");
            result.setFollowUpSteps("Follow up with your physician if symptoms worsen or persist.");
            result.setFallback(true);
            return result;
        }

        if (apiKey == null || apiKey.trim().isEmpty() || "your_gemini_api_key_here".equals(apiKey)) {
            logger.warn("Gemini API key not configured. Using rule-based fallback post-visit summary.");
            aiRateLimiterService.recordFallbackCall();
            return generateFallbackPostVisit(clinicalNotes, prescriptionSummary);
        }

        // Rate Limit & Quota Check
        if (!aiRateLimiterService.tryAcquire(userIdentifier)) {
            logger.warn("AI Rate limit or daily quota reached. Switching to rule-based fallback post-visit summary.");
            aiRateLimiterService.recordFallbackCall();
            return generateFallbackPostVisit(clinicalNotes, prescriptionSummary);
        }

        try {
            String prompt = """
                You are an empathetic healthcare communication specialist.
                Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps:
                <notes>
                %s
                </notes>

                You MUST return ONLY a valid JSON object strictly matching this schema with no markdown backticks:
                {
                  "patient_friendly_summary": "Clear, reassuring explanation in simple 5th-grade language of what was diagnosed and discussed",
                  "medication_schedule": "Clear bullet points of what medicine to take, when, and with/after food",
                  "warning_signs": [
                    "Warning sign 1 requiring immediate medical attention",
                    "Warning sign 2"
                  ],
                  "follow_up_steps": "Actionable next steps (e.g. rest, tests, follow-up appointment in X days)"
                }
                """.formatted(combinedNotes.replace("\"", "\\\""));

            String rawResponse = callGeminiApi(prompt);
            AiPostVisitResult result = parsePostVisitResponse(rawResponse, clinicalNotes, prescriptionSummary);
            aiRateLimiterService.recordSuccessfulAiCall();
            return result;
        } catch (Exception e) {
            logger.error("Failed to execute Gemini post-visit summary. Activating graceful degradation fallback: {}", e.getMessage());
            aiRateLimiterService.recordFallbackCall();
            return generateFallbackPostVisit(clinicalNotes, prescriptionSummary);
        }
    }

    private String callGeminiApi(String promptText) throws Exception {
        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> textPart = Map.of("text", promptText);
        Map<String, Object> contents = Map.of("parts", List.of(textPart));
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(contents),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "maxOutputTokens", 1024
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        }
        throw new IllegalStateException("Empty response from Gemini API");
    }

    private AiTriageResult parseTriageResponse(String rawText, String originalSymptoms) {
        try {
            String cleanedJson = cleanJsonString(rawText);
            JsonNode node = objectMapper.readTree(cleanedJson);

            String urgencyStr = node.path("urgency").asText("Medium").toUpperCase();
            UrgencyLevel urgency;
            if (urgencyStr.contains("HIGH")) urgency = UrgencyLevel.HIGH;
            else if (urgencyStr.contains("LOW")) urgency = UrgencyLevel.LOW;
            else urgency = UrgencyLevel.MEDIUM;

            String chiefComplaint = node.path("chief_complaint").asText();
            if (chiefComplaint.isBlank()) chiefComplaint = originalSymptoms;

            List<String> questions = new ArrayList<>();
            JsonNode qNode = node.path("suggested_questions");
            if (qNode.isArray()) {
                for (JsonNode q : qNode) {
                    questions.add(q.asText());
                }
            }
            if (questions.isEmpty()) {
                questions.add("How long have you noticed these symptoms?");
                questions.add("Are the symptoms becoming more intense over time?");
                questions.add("Have you tried any home remedies or over-the-counter medication?");
            }

            return new AiTriageResult(urgency, chiefComplaint, questions, false);
        } catch (Exception e) {
            logger.warn("Could not parse JSON from Gemini triage output. Falling back to rule-based parser: {}", e.getMessage());
            return generateFallbackTriage(originalSymptoms);
        }
    }

    private AiPostVisitResult parsePostVisitResponse(String rawText, String notes, String prescription) {
        try {
            String cleanedJson = cleanJsonString(rawText);
            JsonNode node = objectMapper.readTree(cleanedJson);

            AiPostVisitResult result = new AiPostVisitResult();
            result.setPatientFriendlySummary(node.path("patient_friendly_summary").asText());
            result.setMedicationSchedule(node.path("medication_schedule").asText());
            result.setFollowUpSteps(node.path("follow_up_steps").asText());

            List<String> warnings = new ArrayList<>();
            JsonNode wNode = node.path("warning_signs");
            if (wNode.isArray()) {
                for (JsonNode w : wNode) {
                    warnings.add(w.asText());
                }
            }
            result.setWarningSigns(warnings);
            result.setFallback(false);
            return result;
        } catch (Exception e) {
            logger.warn("Could not parse JSON from Gemini post-visit output. Falling back: {}", e.getMessage());
            return generateFallbackPostVisit(notes, prescription);
        }
    }

    private String cleanJsonString(String raw) {
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }

    /**
     * Deterministic Rule-Based Fallback for Pre-Visit Triage
     */
    private AiTriageResult generateFallbackTriage(String symptoms) {
        String lower = symptoms.toLowerCase();
        UrgencyLevel urgency = UrgencyLevel.LOW;

        if (lower.contains("chest pain") || lower.contains("shortness of breath") || 
            lower.contains("severe bleeding") || lower.contains("unconscious") || 
            lower.contains("fainting") || lower.contains("high fever")) {
            urgency = UrgencyLevel.HIGH;
        } else if (lower.contains("fever") || lower.contains("pain") || 
            lower.contains("vomiting") || lower.contains("infection") || 
            lower.contains("dizziness") || lower.contains("swelling")) {
            urgency = UrgencyLevel.MEDIUM;
        }

        String chiefComplaint = symptoms.length() > 80 ? symptoms.substring(0, 77) + "..." : symptoms;
        List<String> questions = List.of(
                "When did the symptoms first start and has anything provided relief?",
                "Are you experiencing any other related symptoms such as fever or fatigue?",
                "Do you have any existing chronic conditions or current prescriptions?"
        );

        return new AiTriageResult(urgency, chiefComplaint, questions, true);
    }

    /**
     * Rule-Based Fallback for Post-Visit Summary
     */
    private AiPostVisitResult generateFallbackPostVisit(String clinicalNotes, String prescriptionSummary) {
        AiPostVisitResult result = new AiPostVisitResult();
        result.setPatientFriendlySummary(clinicalNotes != null && !clinicalNotes.isBlank() ?
                "Summary of your visit: " + clinicalNotes : "Thank you for attending your consultation today.");
        
        if (prescriptionSummary != null && !prescriptionSummary.isBlank()) {
            result.setMedicationSchedule("Please follow your prescribed medication regimen: " + prescriptionSummary);
        } else {
            result.setMedicationSchedule("Continue any previously prescribed treatments or maintain standard hydration and rest.");
        }

        result.setWarningSigns(List.of(
                "High fever unresponsive to medication",
                "Severe persistent pain or sudden difficulty breathing",
                "Any allergic reaction or unusual rash"
        ));
        result.setFollowUpSteps("Follow up in 7 days or sooner if symptoms persist or worsen.");
        result.setFallback(true);
        return result;
    }
}
