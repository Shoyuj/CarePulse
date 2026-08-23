package com.healthcare.manager.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.manager.dto.*;
import com.healthcare.manager.entity.*;
import com.healthcare.manager.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorLeaveRepository doctorLeaveRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicationItemRepository medicationItemRepository;
    private final UserRepository userRepository;
    private final GeminiAiService geminiAiService;
    private final EmailNotificationService emailNotificationService;
    private final GoogleCalendarService googleCalendarService;
    private final ObjectMapper objectMapper;

    @Value("${app.booking.hold-duration-minutes:5}")
    private int holdDurationMinutes;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorProfileRepository doctorProfileRepository,
                              DoctorLeaveRepository doctorLeaveRepository,
                              PrescriptionRepository prescriptionRepository,
                              MedicationItemRepository medicationItemRepository,
                              UserRepository userRepository,
                              GeminiAiService geminiAiService,
                              EmailNotificationService emailNotificationService,
                              GoogleCalendarService googleCalendarService,
                              ObjectMapper objectMapper) {
        this.appointmentRepository = appointmentRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.doctorLeaveRepository = doctorLeaveRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicationItemRepository = medicationItemRepository;
        this.userRepository = userRepository;
        this.geminiAiService = geminiAiService;
        this.emailNotificationService = emailNotificationService;
        this.googleCalendarService = googleCalendarService;
        this.objectMapper = objectMapper;
    }

    /**
     * Slot Hold Mechanism: Temporarily reserves a time slot for 5 minutes
     * Prevents double-booking during symptom questionnaire completion.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public HoldSlotResponse holdSlot(UUID patientId, HoldSlotRequest request) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));

        DoctorProfile doctor = doctorProfileRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + request.getDoctorId()));

        // Prevent doctors from booking appointments with themselves (matched by user ID and email)
        if (doctor.getUser() != null) {
            if (doctor.getUser().getId().equals(patientId) ||
                (doctor.getUser().getEmail() != null && patient.getEmail() != null && doctor.getUser().getEmail().equalsIgnoreCase(patient.getEmail().trim()))) {
                throw new IllegalStateException("Doctors cannot book a consultation appointment with themselves. Please choose another specialist doctor.");
            }
        }

        LocalDate date = request.getAppointmentDate();
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book an appointment for a past date.");
        }
        if (date.equals(LocalDate.now()) && request.getStartTime().isBefore(LocalTime.now())) {
            throw new IllegalArgumentException("Cannot book a time slot in the past. Please select an upcoming slot.");
        }

        // Check if doctor is on leave
        if (doctorLeaveRepository.existsByDoctorProfileIdAndLeaveDate(doctor.getId(), date)) {
            throw new IllegalStateException("Doctor is on leave on " + date + ". Please select another date.");
        }

        LocalTime startTime = request.getStartTime();
        int slotMinutes = doctor.getSlotDurationMinutes() > 0 ? doctor.getSlotDurationMinutes() : 30;
        LocalTime endTime = request.getEndTime() != null ? request.getEndTime() : startTime.plusMinutes(slotMinutes);

        LocalDateTime now = LocalDateTime.now();

        // Check for conflicting confirmed or unexpired holds
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                doctor.getId(), date, startTime, endTime, now
        );

        for (Appointment conflict : conflicts) {
            if (conflict.getStatus() == AppointmentStatus.CONFIRMED || conflict.getStatus() == AppointmentStatus.COMPLETED) {
                throw new IllegalStateException("This time slot has already been booked. Please select another slot.");
            }
            if (conflict.getStatus() == AppointmentStatus.HELD && conflict.getHoldExpiresAt().isAfter(now)) {
                // If held by the same patient, extend the hold
                if (conflict.getPatient().getId().equals(patientId)) {
                    conflict.setHoldExpiresAt(now.plusMinutes(holdDurationMinutes));
                    appointmentRepository.save(conflict);
                    return new HoldSlotResponse(
                            conflict.getId(),
                            AppointmentStatus.HELD,
                            conflict.getHoldExpiresAt(),
                            holdDurationMinutes * 60L,
                            "Slot hold refreshed for 5 minutes."
                    );
                }
                throw new IllegalStateException("This slot is currently held by another patient. Please choose another slot or try again in a few minutes.");
            }
        }

        // Create new HELD appointment
        Appointment appointment = new Appointment(patient, doctor, date, startTime, endTime);
        appointment.setHoldExpiresAt(now.plusMinutes(holdDurationMinutes));
        appointment = appointmentRepository.save(appointment);

        return new HoldSlotResponse(
                appointment.getId(),
                AppointmentStatus.HELD,
                appointment.getHoldExpiresAt(),
                holdDurationMinutes * 60L,
                "Slot held successfully for " + holdDurationMinutes + " minutes. Please submit your symptoms to confirm."
        );
    }

    /**
     * Final Confirmation: Atomic database transaction with Pre-Visit AI Triage
     */
    @Transactional
    public AppointmentDto confirmBooking(UUID patientId, ConfirmBookingRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + request.getAppointmentId()));

        if (!appointment.getPatient().getId().equals(patientId)) {
            throw new IllegalStateException("Unauthorized: This appointment hold belongs to another user.");
        }

        LocalDateTime now = LocalDateTime.now();

        if (appointment.getStatus() != AppointmentStatus.HELD) {
            throw new IllegalStateException("Appointment is not in HELD status (Current status: " + appointment.getStatus() + ")");
        }

        if (appointment.getHoldExpiresAt() == null || appointment.getHoldExpiresAt().isBefore(now)) {
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointmentRepository.save(appointment);
            throw new IllegalStateException("Your 5-minute slot hold has expired. Please select and hold the slot again.");
        }

        // Save Symptoms
        String symptoms = request.getPatientSymptoms();
        appointment.setPatientSymptoms(symptoms);

        // Run Pre-visit AI Triage
        try {
            AiTriageResult triageResult = geminiAiService.analyzePreVisitSymptoms(symptoms, patientId.toString());
            appointment.setAiUrgencyLevel(triageResult.getUrgency());
            appointment.setAiChiefComplaint(triageResult.getChiefComplaint());
            appointment.setAiSuggestedQuestions(objectMapper.writeValueAsString(triageResult.getSuggestedQuestions()));
            appointment.setAiStatus(triageResult.isFallback() ? AiStatus.FALLBACK : AiStatus.SUCCESS);
        } catch (Exception e) {
            logger.warn("AI Triage encountered an error, activating fallback: {}", e.getMessage());
            appointment.setAiUrgencyLevel(UrgencyLevel.MEDIUM);
            appointment.setAiChiefComplaint(symptoms);
            appointment.setAiStatus(AiStatus.FALLBACK);
        }

        // Finalize Confirmation
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setHoldExpiresAt(null);

        // Sync Google Calendar
        String gcalId = googleCalendarService.createOrSyncCalendarEvent(appointment);
        appointment.setGoogleCalendarEventId(gcalId);

        appointment = appointmentRepository.save(appointment);

        // Dispatch Email Confirmation
        emailNotificationService.sendBookingConfirmation(appointment);

        AppointmentDto dto = AppointmentDto.fromEntity(appointment);
        dto.setGoogleCalendarLink(googleCalendarService.generateGoogleCalendarLink(appointment));
        return dto;
    }

    /**
     * Doctor Leave Management & Cascade Conflict Handling
     * Marks leave, cancels conflicting bookings, and alerts affected patients.
     */
    @Transactional
    public DoctorLeaveDto applyDoctorLeave(UUID doctorId, LocalDate leaveDate, String reason) {
        DoctorProfile doctor = doctorProfileRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorId));

        if (doctorLeaveRepository.existsByDoctorProfileIdAndLeaveDate(doctorId, leaveDate)) {
            throw new IllegalStateException("Doctor is already marked on leave for " + leaveDate);
        }

        // Record leave
        DoctorLeave leave = new DoctorLeave(doctor, leaveDate, reason != null ? reason : "Doctor Leave");
        leave = doctorLeaveRepository.save(leave);

        // Find conflicting appointments
        List<Appointment> conflicts = appointmentRepository.findActiveAppointmentsForDoctorOnDate(doctorId, leaveDate);
        int affectedCount = 0;

        for (Appointment app : conflicts) {
            app.setStatus(AppointmentStatus.CANCELLED_LEAVE);
            googleCalendarService.cancelCalendarEvent(app.getGoogleCalendarEventId());
            appointmentRepository.save(app);

            // Send Leave Alert to Patient
            emailNotificationService.sendDoctorLeaveAlert(app, leave);
            affectedCount++;
        }

        logger.info("Doctor {} marked on leave for {}. Cancelled {} conflicting appointments.",
                doctor.getUser().getFullName(), leaveDate, affectedCount);

        DoctorLeaveDto dto = DoctorLeaveDto.fromEntity(leave);
        dto.setAffectedAppointmentsCount(affectedCount);
        return dto;
    }

    /**
     * Doctor Submits Clinical Notes & Prescription -> Generates AI Post-Visit Summary
     */
    @Transactional
    public PrescriptionDto submitClinicalNotes(UUID doctorUserId, UUID appointmentId, PostVisitNotesRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));

        if (!appointment.getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new IllegalStateException("Unauthorized: You are not assigned to this appointment.");
        }

        // Save clinical notes
        appointment.setDoctorClinicalNotes(request.getClinicalNotes());

        // Build prescription summary string for LLM
        StringBuilder rxSummary = new StringBuilder();
        if (request.getMedications() != null && !request.getMedications().isEmpty()) {
            for (MedicationItemDto med : request.getMedications()) {
                rxSummary.append("- ").append(med.getMedicineName())
                        .append(" (").append(med.getDosage()).append("): ")
                        .append(med.getFrequency()).append(", ")
                        .append(med.getTiming() != null ? med.getTiming() : "")
                        .append(" for ").append(med.getDurationDays()).append(" days.\n");
            }
        }

        // AI Post-Visit Summary
        AiPostVisitResult postVisitResult = geminiAiService.generatePostVisitSummary(
                request.getClinicalNotes(), rxSummary.toString(), doctorUserId.toString()
        );
        appointment.setAiPatientSummary(postVisitResult.getPatientFriendlySummary());
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment = appointmentRepository.save(appointment);

        // Save Prescription & Medications
        Prescription prescription = new Prescription(
                appointment,
                appointment.getPatient(),
                appointment.getDoctor(),
                request.getFollowUpInstructions(),
                request.getFollowUpDate()
        );

        if (request.getMedications() != null) {
            for (MedicationItemDto medDto : request.getMedications()) {
                MedicationItem item = new MedicationItem(
                        medDto.getMedicineName(),
                        medDto.getDosage(),
                        medDto.getFrequency(),
                        medDto.getTiming(),
                        medDto.getDurationDays(),
                        medDto.getReminderTimes() != null ? medDto.getReminderTimes() : "08:00,20:00",
                        medDto.getInstructions()
                );
                prescription.addMedication(item);
            }
        }

        prescription = prescriptionRepository.save(prescription);

        // Send Post-Visit Summary Email
        emailNotificationService.sendPostVisitSummary(appointment, postVisitResult.getPatientFriendlySummary());

        return PrescriptionDto.fromEntity(prescription);
    }

    public List<AppointmentDto> getPatientAppointments(UUID patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDescStartTimeDesc(patientId).stream()
                .map(app -> {
                    AppointmentDto dto = AppointmentDto.fromEntity(app);
                    dto.setGoogleCalendarLink(googleCalendarService.generateGoogleCalendarLink(app));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getDoctorAppointments(UUID doctorProfileId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(doctorProfileId).stream()
                .map(app -> {
                    AppointmentDto dto = AppointmentDto.fromEntity(app);
                    dto.setGoogleCalendarLink(googleCalendarService.generateGoogleCalendarLink(app));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(app -> {
                    AppointmentDto dto = AppointmentDto.fromEntity(app);
                    dto.setGoogleCalendarLink(googleCalendarService.generateGoogleCalendarLink(app));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public AppointmentDto getAppointmentById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + id));
        AppointmentDto dto = AppointmentDto.fromEntity(appointment);
        dto.setGoogleCalendarLink(googleCalendarService.generateGoogleCalendarLink(appointment));
        return dto;
    }

    @Transactional
    public void cancelAppointment(UUID appointmentId, UUID userId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        googleCalendarService.cancelCalendarEvent(appointment.getGoogleCalendarEventId());
        appointmentRepository.save(appointment);

        emailNotificationService.sendCancellation(appointment, reason);
    }
}
