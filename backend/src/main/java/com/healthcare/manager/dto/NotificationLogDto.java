package com.healthcare.manager.dto;

import com.healthcare.manager.entity.NotificationLog;
import com.healthcare.manager.entity.NotificationStatus;
import com.healthcare.manager.entity.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationLogDto {

    private UUID id;
    private UUID appointmentId;
    private String recipientEmail;
    private String recipientName;
    private NotificationType notificationType;
    private NotificationStatus status;
    private String subject;
    private String content;
    private int retryCount;
    private LocalDateTime lastAttemptAt;
    private String errorMessage;
    private LocalDateTime createdAt;

    public NotificationLogDto() {
    }

    public static NotificationLogDto fromEntity(NotificationLog log) {
        NotificationLogDto dto = new NotificationLogDto();
        dto.setId(log.getId());
        dto.setAppointmentId(log.getAppointmentId());
        dto.setRecipientEmail(log.getRecipientEmail());
        dto.setRecipientName(log.getRecipientName());
        dto.setNotificationType(log.getNotificationType());
        dto.setStatus(log.getStatus());
        dto.setSubject(log.getSubject());
        dto.setContent(log.getContent());
        dto.setRetryCount(log.getRetryCount());
        dto.setLastAttemptAt(log.getLastAttemptAt());
        dto.setErrorMessage(log.getErrorMessage());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(UUID appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(int retryCount) {
        this.retryCount = retryCount;
    }

    public LocalDateTime getLastAttemptAt() {
        return lastAttemptAt;
    }

    public void setLastAttemptAt(LocalDateTime lastAttemptAt) {
        this.lastAttemptAt = lastAttemptAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
