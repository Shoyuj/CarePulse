package com.healthcare.manager.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PostVisitNotesRequest {

    @NotBlank(message = "Clinical notes are required")
    private String clinicalNotes;

    private String followUpInstructions;

    private LocalDate followUpDate;

    private List<MedicationItemDto> medications = new ArrayList<>();

    public PostVisitNotesRequest() {
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getFollowUpInstructions() {
        return followUpInstructions;
    }

    public void setFollowUpInstructions(String followUpInstructions) {
        this.followUpInstructions = followUpInstructions;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public List<MedicationItemDto> getMedications() {
        return medications;
    }

    public void setMedications(List<MedicationItemDto> medications) {
        this.medications = medications;
    }
}
