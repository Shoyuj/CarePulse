package com.healthcare.manager.dto;

import com.healthcare.manager.entity.AppointmentStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public class HoldSlotResponse {

    private UUID appointmentId;
    private AppointmentStatus status;
    private LocalDateTime holdExpiresAt;
    private long holdDurationSeconds;
    private String message;

    public HoldSlotResponse() {
    }

    public HoldSlotResponse(UUID appointmentId, AppointmentStatus status, LocalDateTime holdExpiresAt, long holdDurationSeconds, String message) {
        this.appointmentId = appointmentId;
        this.status = status;
        this.holdExpiresAt = holdExpiresAt;
        this.holdDurationSeconds = holdDurationSeconds;
        this.message = message;
    }

    public UUID getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(UUID appointmentId) {
        this.appointmentId = appointmentId;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getHoldExpiresAt() {
        return holdExpiresAt;
    }

    public void setHoldExpiresAt(LocalDateTime holdExpiresAt) {
        this.holdExpiresAt = holdExpiresAt;
    }

    public long getHoldDurationSeconds() {
        return holdDurationSeconds;
    }

    public void setHoldDurationSeconds(long holdDurationSeconds) {
        this.holdDurationSeconds = holdDurationSeconds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
