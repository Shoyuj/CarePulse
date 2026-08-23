package com.healthcare.manager.dto;

import com.healthcare.manager.entity.UrgencyLevel;
import java.util.ArrayList;
import java.util.List;

public class AiTriageResult {

    private UrgencyLevel urgency = UrgencyLevel.MEDIUM;
    private String chiefComplaint;
    private List<String> suggestedQuestions = new ArrayList<>();
    private boolean fallback = false;

    public AiTriageResult() {
    }

    public AiTriageResult(UrgencyLevel urgency, String chiefComplaint, List<String> suggestedQuestions, boolean fallback) {
        this.urgency = urgency;
        this.chiefComplaint = chiefComplaint;
        this.suggestedQuestions = suggestedQuestions;
        this.fallback = fallback;
    }

    public UrgencyLevel getUrgency() {
        return urgency;
    }

    public void setUrgency(UrgencyLevel urgency) {
        this.urgency = urgency;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public List<String> getSuggestedQuestions() {
        return suggestedQuestions;
    }

    public void setSuggestedQuestions(List<String> suggestedQuestions) {
        this.suggestedQuestions = suggestedQuestions;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }
}
