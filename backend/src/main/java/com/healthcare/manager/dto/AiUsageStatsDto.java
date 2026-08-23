package com.healthcare.manager.dto;

public class AiUsageStatsDto {
    private boolean rateLimitingEnabled;
    private int requestsPerMinuteLimit;
    private int dailyQuotaLimit;
    private int userHourlyLimit;
    private int requestsInCurrentMinute;
    private int requestsToday;
    private int remainingDailyQuota;
    private long totalSuccessfulAiCalls;
    private long totalFallbackCalls;

    public AiUsageStatsDto() {
    }

    public AiUsageStatsDto(boolean rateLimitingEnabled, int requestsPerMinuteLimit, int dailyQuotaLimit,
                           int userHourlyLimit, int requestsInCurrentMinute, int requestsToday,
                           int remainingDailyQuota, long totalSuccessfulAiCalls, long totalFallbackCalls) {
        this.rateLimitingEnabled = rateLimitingEnabled;
        this.requestsPerMinuteLimit = requestsPerMinuteLimit;
        this.dailyQuotaLimit = dailyQuotaLimit;
        this.userHourlyLimit = userHourlyLimit;
        this.requestsInCurrentMinute = requestsInCurrentMinute;
        this.requestsToday = requestsToday;
        this.remainingDailyQuota = remainingDailyQuota;
        this.totalSuccessfulAiCalls = totalSuccessfulAiCalls;
        this.totalFallbackCalls = totalFallbackCalls;
    }

    public boolean isRateLimitingEnabled() {
        return rateLimitingEnabled;
    }

    public void setRateLimitingEnabled(boolean rateLimitingEnabled) {
        this.rateLimitingEnabled = rateLimitingEnabled;
    }

    public int getRequestsPerMinuteLimit() {
        return requestsPerMinuteLimit;
    }

    public void setRequestsPerMinuteLimit(int requestsPerMinuteLimit) {
        this.requestsPerMinuteLimit = requestsPerMinuteLimit;
    }

    public int getDailyQuotaLimit() {
        return dailyQuotaLimit;
    }

    public void setDailyQuotaLimit(int dailyQuotaLimit) {
        this.dailyQuotaLimit = dailyQuotaLimit;
    }

    public int getUserHourlyLimit() {
        return userHourlyLimit;
    }

    public void setUserHourlyLimit(int userHourlyLimit) {
        this.userHourlyLimit = userHourlyLimit;
    }

    public int getRequestsInCurrentMinute() {
        return requestsInCurrentMinute;
    }

    public void setRequestsInCurrentMinute(int requestsInCurrentMinute) {
        this.requestsInCurrentMinute = requestsInCurrentMinute;
    }

    public int getRequestsToday() {
        return requestsToday;
    }

    public void setRequestsToday(int requestsToday) {
        this.requestsToday = requestsToday;
    }

    public int getRemainingDailyQuota() {
        return remainingDailyQuota;
    }

    public void setRemainingDailyQuota(int remainingDailyQuota) {
        this.remainingDailyQuota = remainingDailyQuota;
    }

    public long getTotalSuccessfulAiCalls() {
        return totalSuccessfulAiCalls;
    }

    public void setTotalSuccessfulAiCalls(long totalSuccessfulAiCalls) {
        this.totalSuccessfulAiCalls = totalSuccessfulAiCalls;
    }

    public long getTotalFallbackCalls() {
        return totalFallbackCalls;
    }

    public void setTotalFallbackCalls(long totalFallbackCalls) {
        this.totalFallbackCalls = totalFallbackCalls;
    }
}
