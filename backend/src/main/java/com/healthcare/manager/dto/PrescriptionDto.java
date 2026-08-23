package com.healthcare.manager.dto;

import com.healthcare.manager.entity.Prescription;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class PrescriptionDto {

    private UUID id;
    private UUID appointmentId;
    private UUID patientId;
    private String patientName;
    private UUID doctorId;
    private String doctorName;
    private String followUpInstructions;
    private LocalDate followUpDate;
    private List<MedicationItemDto> medications = new ArrayList<>();
    private LocalDateTime createdAt;

    public PrescriptionDto() {
    }

    public static PrescriptionDto fromEntity(Prescription prescription) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(prescription.getId());
        if (prescription.getAppointment() != null) {
            dto.setAppointmentId(prescription.getAppointment().getId());
        }
        if (prescription.getPatient() != null) {
            dto.setPatientId(prescription.getPatient().getId());
            dto.setPatientName(prescription.getPatient().getFullName());
        }
        if (prescription.getDoctor() != null) {
            dto.setDoctorId(prescription.getDoctor().getId());
            if (prescription.getDoctor().getUser() != null) {
                dto.setDoctorName(prescription.getDoctor().getUser().getFullName());
            }
        }
        dto.setFollowUpInstructions(prescription.getFollowUpInstructions());
        dto.setFollowUpDate(prescription.getFollowUpDate());
        if (prescription.getMedications() != null) {
            dto.setMedications(prescription.getMedications().stream()
                    .map(MedicationItemDto::fromEntity)
                    .collect(Collectors.toList()));
        }
        dto.setCreatedAt(prescription.getCreatedAt());
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

    public UUID getPatientId() {
        return patientId;
    }

    public void setPatientId(UUID patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public UUID getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(UUID doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
