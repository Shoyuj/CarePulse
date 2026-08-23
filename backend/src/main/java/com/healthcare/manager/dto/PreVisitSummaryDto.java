package com.healthcare.manager.dto;

import com.healthcare.manager.entity.UrgencyLevel;
import java.util.ArrayList;
import java.util.List;

public class PreVisitSummaryDto {

    private UrgencyLevel urgencyLevel;
    private String chiefComplaint;
    private List<String> suggestedQuestions = new ArrayList<>();
    private boolean isFallback = false;

    public PreVisitSummaryDto() {
    }

    public PreVisitSummaryDto(UrgencyLevel urgencyLevel, String chiefComplaint, List<String> suggestedQuestions, boolean isFallback) {
        this.urgencyLevel = urgencyLevel;
        this.chiefComplaint = chiefComplaint;
        this.suggestedQuestions = suggestedQuestions;
        this.isFallback = isFallback;
    }

    public UrgencyLevel getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(UrgencyLevel urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
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
        return isFallback;
    }

    public void setFallback(boolean fallback) {
        isFallback = fallback;
    }
}
