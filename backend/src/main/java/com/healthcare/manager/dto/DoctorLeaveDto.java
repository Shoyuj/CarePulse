package com.healthcare.manager.dto;

import com.healthcare.manager.entity.DoctorLeave;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class DoctorLeaveDto {

    private UUID id;
    private UUID doctorProfileId;

    @NotNull(message = "Leave date is required")
    private LocalDate leaveDate;

    private String reason;
    private LocalDateTime createdAt;
    private int affectedAppointmentsCount = 0;

    public DoctorLeaveDto() {
    }

    public static DoctorLeaveDto fromEntity(DoctorLeave leave) {
        DoctorLeaveDto dto = new DoctorLeaveDto();
        dto.setId(leave.getId());
        dto.setDoctorProfileId(leave.getDoctorProfile().getId());
        dto.setLeaveDate(leave.getLeaveDate());
        dto.setReason(leave.getReason());
        dto.setCreatedAt(leave.getCreatedAt());
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getDoctorProfileId() {
        return doctorProfileId;
    }

    public void setDoctorProfileId(UUID doctorProfileId) {
        this.doctorProfileId = doctorProfileId;
    }

    public LocalDate getLeaveDate() {
        return leaveDate;
    }

    public void setLeaveDate(LocalDate leaveDate) {
        this.leaveDate = leaveDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getAffectedAppointmentsCount() {
        return affectedAppointmentsCount;
    }

    public void setAffectedAppointmentsCount(int affectedAppointmentsCount) {
        this.affectedAppointmentsCount = affectedAppointmentsCount;
    }
}
