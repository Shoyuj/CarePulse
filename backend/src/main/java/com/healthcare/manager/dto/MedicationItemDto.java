package com.healthcare.manager.dto;

import com.healthcare.manager.entity.MedicationItem;
import java.time.LocalDateTime;
import java.util.UUID;

public class MedicationItemDto {

    private UUID id;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String timing;
    private int durationDays = 5;
    private String reminderTimes;
    private String instructions;
    private LocalDateTime createdAt;

    public MedicationItemDto() {
    }

    public static MedicationItemDto fromEntity(MedicationItem item) {
        MedicationItemDto dto = new MedicationItemDto();
        dto.setId(item.getId());
        dto.setMedicineName(item.getMedicineName());
        dto.setDosage(item.getDosage());
        dto.setFrequency(item.getFrequency());
        dto.setTiming(item.getTiming());
        dto.setDurationDays(item.getDurationDays());
        dto.setReminderTimes(item.getReminderTimes());
        dto.setInstructions(item.getInstructions());
        dto.setCreatedAt(item.getCreatedAt());
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getTiming() {
        return timing;
    }

    public void setTiming(String timing) {
        this.timing = timing;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public String getReminderTimes() {
        return reminderTimes;
    }

    public void setReminderTimes(String reminderTimes) {
        this.reminderTimes = reminderTimes;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
