package com.healthcare.manager.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_app_doc_date_time", columnList = "doctor_id, appointment_date, start_time"),
    @Index(name = "idx_app_status_hold", columnList = "status, hold_expires_at")
})
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorProfile doctor;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.HELD;

    @Column(name = "hold_expires_at")
    private LocalDateTime holdExpiresAt;

    @Column(name = "patient_symptoms", columnDefinition = "TEXT")
    private String patientSymptoms;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_urgency_level")
    private UrgencyLevel aiUrgencyLevel;

    @Column(name = "ai_chief_complaint", columnDefinition = "TEXT")
    private String aiChiefComplaint;

    @Column(name = "ai_suggested_questions", columnDefinition = "TEXT")
    private String aiSuggestedQuestions;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_status")
    private AiStatus aiStatus = AiStatus.PENDING;

    @Column(name = "doctor_clinical_notes", columnDefinition = "TEXT")
    private String doctorClinicalNotes;

    @Column(name = "ai_patient_summary", columnDefinition = "TEXT")
    private String aiPatientSummary;

    @Column(name = "google_calendar_event_id")
    private String googleCalendarEventId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Appointment() {
    }

    public Appointment(User patient, DoctorProfile doctor, LocalDate appointmentDate, LocalTime startTime, LocalTime endTime) {
        this.patient = patient;
        this.doctor = doctor;
        this.appointmentDate = appointmentDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = AppointmentStatus.HELD;
        this.holdExpiresAt = LocalDateTime.now().plusMinutes(5);
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isHoldActive() {
        return this.status == AppointmentStatus.HELD && this.holdExpiresAt != null && this.holdExpiresAt.isAfter(LocalDateTime.now());
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getPatient() {
        return patient;
    }

    public void setPatient(User patient) {
        this.patient = patient;
    }

    public DoctorProfile getDoctor() {
        return doctor;
    }

    public void setDoctor(DoctorProfile doctor) {
        this.doctor = doctor;
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

    public String getAiSuggestedQuestions() {
        return aiSuggestedQuestions;
    }

    public void setAiSuggestedQuestions(String aiSuggestedQuestions) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
