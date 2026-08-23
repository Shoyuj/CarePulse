package com.healthcare.manager.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.manager.entity.AiStatus;
import com.healthcare.manager.entity.Appointment;
import com.healthcare.manager.entity.AppointmentStatus;
import com.healthcare.manager.entity.UrgencyLevel;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AppointmentDto {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private UUID id;
    private UUID patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    private UUID doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String doctorQualification;

    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private AppointmentStatus status;
    private LocalDateTime holdExpiresAt;
    private String patientSymptoms;

    private UrgencyLevel aiUrgencyLevel;
    private String aiChiefComplaint;
    private List<String> aiSuggestedQuestions = new ArrayList<>();
    private AiStatus aiStatus;

    private String doctorClinicalNotes;
    private String aiPatientSummary;
    private String googleCalendarEventId;
    private String googleCalendarLink;
    private LocalDateTime createdAt;

    public AppointmentDto() {
    }

    public static AppointmentDto fromEntity(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());

        if (appointment.getPatient() != null) {
            dto.setPatientId(appointment.getPatient().getId());
            dto.setPatientName(appointment.getPatient().getFullName());
            dto.setPatientEmail(appointment.getPatient().getEmail());
            dto.setPatientPhone(appointment.getPatient().getPhone());
        }

        if (appointment.getDoctor() != null) {
            dto.setDoctorId(appointment.getDoctor().getId());
            if (appointment.getDoctor().getUser() != null) {
                dto.setDoctorName(appointment.getDoctor().getUser().getFullName());
            }
            dto.setDoctorSpecialization(appointment.getDoctor().getSpecialization());
            dto.setDoctorQualification(appointment.getDoctor().getQualification());
        }

        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setStatus(appointment.getStatus());
        dto.setHoldExpiresAt(appointment.getHoldExpiresAt());
        dto.setPatientSymptoms(appointment.getPatientSymptoms());

        dto.setAiUrgencyLevel(appointment.getAiUrgencyLevel());
        dto.setAiChiefComplaint(appointment.getAiChiefComplaint());
        dto.setAiStatus(appointment.getAiStatus());

        if (appointment.getAiSuggestedQuestions() != null && !appointment.getAiSuggestedQuestions().isBlank()) {
            try {
                List<String> questions = objectMapper.readValue(appointment.getAiSuggestedQuestions(), new TypeReference<List<String>>() {});
                dto.setAiSuggestedQuestions(questions);
            } catch (Exception e) {
                dto.setAiSuggestedQuestions(List.of(appointment.getAiSuggestedQuestions().split(";")));
            }
        }

        dto.setDoctorClinicalNotes(appointment.getDoctorClinicalNotes());
        dto.setAiPatientSummary(appointment.getAiPatientSummary());
        dto.setGoogleCalendarEventId(appointment.getGoogleCalendarEventId());
        dto.setCreatedAt(appointment.getCreatedAt());

        return dto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getPatientEmail() {
        return patientEmail;
    }

    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public void setPatientPhone(String patientPhone) {
        this.patientPhone = patientPhone;
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

    public String getDoctorSpecialization() {
        return doctorSpecialization;
    }

    public void setDoctorSpecialization(String doctorSpecialization) {
        this.doctorSpecialization = doctorSpecialization;
    }

    public String getDoctorQualification() {
        return doctorQualification;
    }

    public void setDoctorQualification(String doctorQualification) {
        this.doctorQualification = doctorQualification;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
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

    public String getPatientSymptoms() {
        return patientSymptoms;
    }

    public void setPatientSymptoms(String patientSymptoms) {
        this.patientSymptoms = patientSymptoms;
    }

    public UrgencyLevel getAiUrgencyLevel() {
        return aiUrgencyLevel;
    }

    public void setAiUrgencyLevel(UrgencyLevel aiUrgencyLevel) {
        this.aiUrgencyLevel = aiUrgencyLevel;
    }

    public String getAiChiefComplaint() {
        return aiChiefComplaint;
    }

    public void setAiChiefComplaint(String aiChiefComplaint) {
        this.aiChiefComplaint = aiChiefComplaint;
    }

    public List<String> getAiSuggestedQuestions() {
        return aiSuggestedQuestions;
    }

    public void setAiSuggestedQuestions(List<String> aiSuggestedQuestions) {
        this.aiSuggestedQuestions = aiSuggestedQuestions;
    }

    public AiStatus getAiStatus() {
        return aiStatus;
    }

    public void setAiStatus(AiStatus aiStatus) {
        this.aiStatus = aiStatus;
    }

    public String getDoctorClinicalNotes() {
        return doctorClinicalNotes;
    }

    public void setDoctorClinicalNotes(String doctorClinicalNotes) {
        this.doctorClinicalNotes = doctorClinicalNotes;
    }

    public String getAiPatientSummary() {
        return aiPatientSummary;
    }

    public void setAiPatientSummary(String aiPatientSummary) {
        this.aiPatientSummary = aiPatientSummary;
    }

    public String getGoogleCalendarEventId() {
        return googleCalendarEventId;
    }

    public void setGoogleCalendarEventId(String googleCalendarEventId) {
        this.googleCalendarEventId = googleCalendarEventId;
    }

    public String getGoogleCalendarLink() {
        return googleCalendarLink;
    }

    public void setGoogleCalendarLink(String googleCalendarLink) {
        this.googleCalendarLink = googleCalendarLink;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
