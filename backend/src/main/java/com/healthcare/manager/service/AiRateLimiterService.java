package com.healthcare.manager.service;

import com.healthcare.manager.dto.AiUsageStatsDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Thread-safe multi-tier Rate Limiter and Quota Management service for Google Gemini AI.
 * Protects against API overuse, accidental budget spikes, and Google 429 errors.
 */
@Service
public class AiRateLimiterService {

    private static final Logger logger = LoggerFactory.getLogger(AiRateLimiterService.class);

    @Value("${app.gemini.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${app.gemini.rate-limit.requests-per-minute:15}")
    private int requestsPerMinute;

    @Value("${app.gemini.rate-limit.daily-quota:500}")
    private int dailyQuota;

    @Value("${app.gemini.rate-limit.user-hourly-limit:10}")
    private int userHourlyLimit;

    // Sliding window tracking for Global RPM (60,000 ms)
    private final ConcurrentLinkedQueue<Long> globalMinuteTimestamps = new ConcurrentLinkedQueue<>();

    // Daily counter and day tracker
    private final AtomicInteger dailyCounter = new AtomicInteger(0);
    private final AtomicReference<LocalDate> currentTrackingDay = new AtomicReference<>(LocalDate.now(ZoneId.systemDefault()));

    // Sliding window tracking for Per-User Hourly limit (3,600,000 ms)
    private final ConcurrentHashMap<String, ConcurrentLinkedQueue<Long>> userHourlyTimestamps = new ConcurrentHashMap<>();

    // Global telemetry counters
    private final AtomicLong totalSuccessfulAiCalls = new AtomicLong(0);
    private final AtomicLong totalFallbackCalls = new AtomicLong(0);

    /**
     * Checks if a new AI request is permitted within configured rate limits and daily quotas.
     *
     * @param userIdentifier Unique user ID, username, or IP address (optional)
     * @return true if permitted, false if any rate limit or quota is exceeded
     */
    public synchronized boolean tryAcquire(String userIdentifier) {
        if (!enabled) {
            return true;
        }

        long now = System.currentTimeMillis();
        checkAndResetDailyCounter();

        // 1. Check Global Daily Quota
        if (dailyCounter.get() >= dailyQuota) {
            logger.warn("Gemini AI daily quota reached ({}/{} calls today). Gracefully switching to fallback engine.",
                    dailyCounter.get(), dailyQuota);
            return false;
        }

        // 2. Check Global RPM (Rolling 60 seconds)
        long oneMinuteAgo = now - 60_000L;
        while (!globalMinuteTimestamps.isEmpty() && globalMinuteTimestamps.peek() < oneMinuteAgo) {
            globalMinuteTimestamps.poll();
        }

        if (globalMinuteTimestamps.size() >= requestsPerMinute) {
            logger.warn("Gemini AI global rate limit reached ({} RPM limit). Gracefully switching to fallback engine.",
                    requestsPerMinute);
            return false;
        }

        // 3. Check Per-User Hourly Limit (Rolling 60 minutes)
        if (userIdentifier != null && !userIdentifier.isBlank()) {
            ConcurrentLinkedQueue<Long> userQueue = userHourlyTimestamps.computeIfAbsent(
                    userIdentifier, k -> new ConcurrentLinkedQueue<>()
            );

            long oneHourAgo = now - 3_600_000L;
            while (!userQueue.isEmpty() && userQueue.peek() < oneHourAgo) {
                userQueue.poll();
            }

            if (userQueue.size() >= userHourlyLimit) {
                logger.warn("Gemini AI user rate limit reached for '{}' ({} calls/hour limit). Gracefully switching to fallback engine.",
                        userIdentifier, userHourlyLimit);
                return false;
            }

            userQueue.add(now);
        }

        // All checks passed -> record request
        globalMinuteTimestamps.add(now);
        dailyCounter.incrementAndGet();
        return true;
    }

    public void recordSuccessfulAiCall() {
        totalSuccessfulAiCalls.incrementAndGet();
    }

    public void recordFallbackCall() {
        totalFallbackCalls.incrementAndGet();
    }

    /**
     * Returns a snapshot of current AI usage and rate-limiting metrics.
     */
    public AiUsageStatsDto getUsageStats() {
        long now = System.currentTimeMillis();
        checkAndResetDailyCounter();

        long oneMinuteAgo = now - 60_000L;
        while (!globalMinuteTimestamps.isEmpty() && globalMinuteTimestamps.peek() < oneMinuteAgo) {
            globalMinuteTimestamps.poll();
        }

        int todayCount = dailyCounter.get();
        int remaining = Math.max(0, dailyQuota - todayCount);

        return new AiUsageStatsDto(
                enabled,
                requestsPerMinute,
                dailyQuota,
                userHourlyLimit,
                globalMinuteTimestamps.size(),
                todayCount,
                remaining,
                totalSuccessfulAiCalls.get(),
                totalFallbackCalls.get()
        );
    }

    private void checkAndResetDailyCounter() {
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        if (!today.equals(currentTrackingDay.get())) {
            currentTrackingDay.set(today);
            dailyCounter.set(0);
            userHourlyTimestamps.clear();
            logger.info("AI Daily usage counters reset for new day: {}", today);
        }
    }

    // Setters for testability
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setRequestsPerMinute(int requestsPerMinute) {
        this.requestsPerMinute = requestsPerMinute;
    }

    public void setDailyQuota(int dailyQuota) {
        this.dailyQuota = dailyQuota;
    }

    public void setUserHourlyLimit(int userHourlyLimit) {
        this.userHourlyLimit = userHourlyLimit;
    }

    public void resetCounters() {
        globalMinuteTimestamps.clear();
        dailyCounter.set(0);
        userHourlyTimestamps.clear();
    }
}
