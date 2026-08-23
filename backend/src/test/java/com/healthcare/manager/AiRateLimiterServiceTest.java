package com.healthcare.manager;

import com.healthcare.manager.dto.AiTriageResult;
import com.healthcare.manager.dto.AiUsageStatsDto;
import com.healthcare.manager.entity.UrgencyLevel;
import com.healthcare.manager.service.AiRateLimiterService;
import com.healthcare.manager.service.GeminiAiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AiRateLimiterServiceTest {

    @Autowired
    private AiRateLimiterService rateLimiterService;

    @Autowired
    private GeminiAiService geminiAiService;

    @BeforeEach
    void setUp() {
        rateLimiterService.resetCounters();
        rateLimiterService.setEnabled(true);
        rateLimiterService.setRequestsPerMinute(15);
        rateLimiterService.setDailyQuota(500);
        rateLimiterService.setUserHourlyLimit(10);
    }

    @Test
    @DisplayName("Enforce global requests-per-minute (RPM) rate limit")
    void testGlobalRpmRateLimit() {
        rateLimiterService.setRequestsPerMinute(3);

        assertTrue(rateLimiterService.tryAcquire("user-1"), "Request 1 should pass");
        assertTrue(rateLimiterService.tryAcquire("user-2"), "Request 2 should pass");
        assertTrue(rateLimiterService.tryAcquire("user-3"), "Request 3 should pass");

        // 4th request in the same minute exceeds limit of 3
        assertFalse(rateLimiterService.tryAcquire("user-4"), "Request 4 should be blocked by RPM limit");
    }

    @Test
    @DisplayName("Enforce global daily quota cap")
    void testDailyQuotaLimit() {
        rateLimiterService.setRequestsPerMinute(100);
        rateLimiterService.setDailyQuota(4);

        assertTrue(rateLimiterService.tryAcquire("user-1"), "Call 1 should pass");
        assertTrue(rateLimiterService.tryAcquire("user-2"), "Call 2 should pass");
        assertTrue(rateLimiterService.tryAcquire("user-3"), "Call 3 should pass");
        assertTrue(rateLimiterService.tryAcquire("user-4"), "Call 4 should pass");

        // 5th request exceeds daily quota of 4
        assertFalse(rateLimiterService.tryAcquire("user-5"), "Call 5 should be blocked by daily quota");
    }

    @Test
    @DisplayName("Enforce per-user hourly quota while allowing other users")
    void testUserHourlyLimit() {
        rateLimiterService.setRequestsPerMinute(50);
        rateLimiterService.setDailyQuota(500);
        rateLimiterService.setUserHourlyLimit(2);

        String spamUser = "patient-spam";
        String honestUser = "patient-honest";

        assertTrue(rateLimiterService.tryAcquire(spamUser), "Spam user call 1 should pass");
        assertTrue(rateLimiterService.tryAcquire(spamUser), "Spam user call 2 should pass");
        assertFalse(rateLimiterService.tryAcquire(spamUser), "Spam user call 3 should be blocked");

        // Honest user should still be able to make calls
        assertTrue(rateLimiterService.tryAcquire(honestUser), "Honest user call 1 should pass");
    }

    @Test
    @DisplayName("GeminiAiService gracefully falls back when rate limiter blocks request")
    void testGracefulFallbackWhenRateLimited() {
        rateLimiterService.setRequestsPerMinute(1);

        // First call acquires token
        AiTriageResult result1 = geminiAiService.analyzePreVisitSymptoms("mild fever for 2 days", "test-patient");
        assertNotNull(result1);
        assertNotNull(result1.getUrgency());

        // Second call immediately hits rate limit, should return fallback without throwing exception
        AiTriageResult result2 = geminiAiService.analyzePreVisitSymptoms("chest pain and shortness of breath", "test-patient");
        assertNotNull(result2, "Rate-limited call must return graceful fallback result");
        assertEquals(UrgencyLevel.HIGH, result2.getUrgency(), "Rule-based fallback correctly detected high urgency");
        assertTrue(result2.isFallback(), "Result should be flagged as fallback");
    }

    @Test
    @DisplayName("Usage statistics DTO accurately reflects rate limiter metrics")
    void testUsageStatsAccuracy() {
        rateLimiterService.setDailyQuota(100);
        rateLimiterService.setRequestsPerMinute(20);
        rateLimiterService.setUserHourlyLimit(10);

        rateLimiterService.tryAcquire("user-1");
        rateLimiterService.tryAcquire("user-2");

        AiUsageStatsDto stats = rateLimiterService.getUsageStats();
        assertEquals(2, stats.getRequestsToday());
        assertEquals(98, stats.getRemainingDailyQuota());
        assertEquals(2, stats.getRequestsInCurrentMinute());
        assertEquals(100, stats.getDailyQuotaLimit());
        assertEquals(20, stats.getRequestsPerMinuteLimit());
        assertTrue(stats.isRateLimitingEnabled());
    }
}
