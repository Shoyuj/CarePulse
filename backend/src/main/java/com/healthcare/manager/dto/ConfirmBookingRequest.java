package com.healthcare.manager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ConfirmBookingRequest {

    @NotNull(message = "Appointment ID is required")
    private UUID appointmentId;

    @NotBlank(message = "Patient symptoms are required")
    private String patientSymptoms;

    public ConfirmBookingRequest() {
    }

    public ConfirmBookingRequest(UUID appointmentId, String patientSymptoms) {
        this.appointmentId = appointmentId;
        this.patientSymptoms = patientSymptoms;
    }

    public UUID getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(UUID appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getPatientSymptoms() {
        return patientSymptoms;
    }

    public void setPatientSymptoms(String patientSymptoms) {
        this.patientSymptoms = patientSymptoms;
    }
}
