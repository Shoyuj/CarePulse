package com.healthcare.manager.dto;

import java.util.ArrayList;
import java.util.List;

public class AiPostVisitResult {

    private String patientFriendlySummary;
    private String medicationSchedule;
    private List<String> warningSigns = new ArrayList<>();
    private String followUpSteps;
    private boolean fallback = false;

    public AiPostVisitResult() {
    }

    public String getPatientFriendlySummary() {
        return patientFriendlySummary;
    }

    public void setPatientFriendlySummary(String patientFriendlySummary) {
        this.patientFriendlySummary = patientFriendlySummary;
    }

    public String getMedicationSchedule() {
        return medicationSchedule;
    }

    public void setMedicationSchedule(String medicationSchedule) {
        this.medicationSchedule = medicationSchedule;
    }

    public List<String> getWarningSigns() {
        return warningSigns;
    }

    public void setWarningSigns(List<String> warningSigns) {
        this.warningSigns = warningSigns;
    }

    public String getFollowUpSteps() {
        return followUpSteps;
    }

    public void setFollowUpSteps(String followUpSteps) {
        this.followUpSteps = followUpSteps;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }
}
