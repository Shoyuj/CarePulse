package com.healthcare.manager.dto;

import com.healthcare.manager.entity.DoctorProfile;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

public class DoctorProfileDto {

    private UUID id;
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String specialization;
    private String qualification;
    private LocalTime workingHoursStart;
    private LocalTime workingHoursEnd;
    private int slotDurationMinutes;
    private BigDecimal consultationFee;
    private String bio;

    public DoctorProfileDto() {
    }

    public static DoctorProfileDto fromEntity(DoctorProfile profile) {
        DoctorProfileDto dto = new DoctorProfileDto();
        dto.setId(profile.getId());
        if (profile.getUser() != null) {
            dto.setUserId(profile.getUser().getId());
            dto.setFullName(profile.getUser().getFullName());
            dto.setEmail(profile.getUser().getEmail());
            dto.setPhone(profile.getUser().getPhone());
        }
        dto.setSpecialization(profile.getSpecialization());
        dto.setQualification(profile.getQualification());
        dto.setWorkingHoursStart(profile.getWorkingHoursStart());
        dto.setWorkingHoursEnd(profile.getWorkingHoursEnd());
        dto.setSlotDurationMinutes(profile.getSlotDurationMinutes());
        dto.setConsultationFee(profile.getConsultationFee());
        dto.setBio(profile.getBio());
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public LocalTime getWorkingHoursStart() {
        return workingHoursStart;
    }

    public void setWorkingHoursStart(LocalTime workingHoursStart) {
        this.workingHoursStart = workingHoursStart;
    }

    public LocalTime getWorkingHoursEnd() {
        return workingHoursEnd;
    }

    public void setWorkingHoursEnd(LocalTime workingHoursEnd) {
        this.workingHoursEnd = workingHoursEnd;
    }

    public int getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public void setSlotDurationMinutes(int slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
