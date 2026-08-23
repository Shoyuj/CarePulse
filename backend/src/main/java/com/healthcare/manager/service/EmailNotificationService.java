package com.healthcare.manager.service;

import com.healthcare.manager.entity.*;
import com.healthcare.manager.repository.NotificationLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    private final NotificationLogRepository notificationLogRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@healthcare-manager.com}")
    private String mailFrom;

    public EmailNotificationService(NotificationLogRepository notificationLogRepository) {
        this.notificationLogRepository = notificationLogRepository;
    }

    @Transactional
    public void sendBookingConfirmation(Appointment appointment) {
        String patientEmail = appointment.getPatient().getEmail();
        String patientName = appointment.getPatient().getFullName();
        String doctorName = appointment.getDoctor().getUser().getFullName();
        String doctorSpecialization = appointment.getDoctor().getSpecialization();
        String formattedDate = appointment.getAppointmentDate().format(DATE_FORMATTER);
        String formattedTime = appointment.getStartTime().format(TIME_FORMATTER);

        String subject = "Appointment Confirmed: Dr. " + doctorName + " on " + formattedDate;
        String content = """
                Dear %s,

                Your appointment has been successfully confirmed!

                --- Appointment Details ---
                Doctor: Dr. %s (%s)
                Date: %s
                Time: %s
                Urgency Level: %s

                Chief Complaint: %s

                Thank you for choosing our clinic.
                """.formatted(
                patientName, doctorName, doctorSpecialization,
                formattedDate, formattedTime,
                appointment.getAiUrgencyLevel() != null ? appointment.getAiUrgencyLevel() : "Standard",
                appointment.getAiChiefComplaint() != null ? appointment.getAiChiefComplaint() : appointment.getPatientSymptoms()
        );

        queueAndSend(appointment.getId(), patientEmail, patientName, NotificationType.BOOKING_CONFIRMATION, subject, content);

        // Also notify doctor
        String doctorEmail = appointment.getDoctor().getUser().getEmail();
        String doctorSubject = "New Appointment Scheduled: " + patientName + " on " + formattedDate;
        String doctorContent = """
                Dear Dr. %s,

                A new appointment has been scheduled with patient %s.

                Date: %s at %s
                Urgency: %s
                Chief Complaint: %s

                AI Suggested Diagnostic Questions:
                %s
                """.formatted(
                doctorName, patientName, formattedDate, formattedTime,
                appointment.getAiUrgencyLevel() != null ? appointment.getAiUrgencyLevel() : "Standard",
                appointment.getAiChiefComplaint() != null ? appointment.getAiChiefComplaint() : appointment.getPatientSymptoms(),
                appointment.getAiSuggestedQuestions() != null ? appointment.getAiSuggestedQuestions() : "Review standard clinical questionnaire."
        );

        queueAndSend(appointment.getId(), doctorEmail, doctorName, NotificationType.BOOKING_CONFIRMATION, doctorSubject, doctorContent);
    }

    @Transactional
    public void sendDoctorLeaveAlert(Appointment appointment, DoctorLeave leave) {
        String patientEmail = appointment.getPatient().getEmail();
        String patientName = appointment.getPatient().getFullName();
        String doctorName = appointment.getDoctor().getUser().getFullName();
        String formattedDate = appointment.getAppointmentDate().format(DATE_FORMATTER);
        String formattedTime = appointment.getStartTime().format(TIME_FORMATTER);

        String subject = "URGENT: Your appointment on " + formattedDate + " has been cancelled due to Doctor Leave";
        String content = """
                Dear %s,

                We regret to inform you that Dr. %s will be on leave on %s (%s).
                Consequently, your appointment scheduled for %s at %s has been cancelled.

                Please log in to your patient dashboard to select an alternate time slot or choose another doctor.
                We sincerely apologize for the inconvenience.
                """.formatted(patientName, doctorName, formattedDate,
                leave.getReason() != null ? leave.getReason() : "Personal leave",
                formattedDate, formattedTime);

        queueAndSend(appointment.getId(), patientEmail, patientName, NotificationType.DOCTOR_LEAVE, subject, content);
    }

    @Transactional
    public void sendCancellation(Appointment appointment, String reason) {
        String patientEmail = appointment.getPatient().getEmail();
        String patientName = appointment.getPatient().getFullName();
        String doctorName = appointment.getDoctor().getUser().getFullName();
        String formattedDate = appointment.getAppointmentDate().format(DATE_FORMATTER);

        String subject = "Appointment Cancelled: Dr. " + doctorName + " on " + formattedDate;
        String content = """
                Dear %s,

                Your appointment with Dr. %s on %s has been cancelled.
                Reason: %s

                If you have any questions, please contact our support team.
                """.formatted(patientName, doctorName, formattedDate, reason != null ? reason : "Requested by user");

        queueAndSend(appointment.getId(), patientEmail, patientName, NotificationType.CANCELLATION, subject, content);
    }

    @Transactional
    public void sendMedicationReminder(MedicationItem item, String patientEmail, String patientName) {
        String subject = "Medication Reminder: Time to take your " + item.getMedicineName();
        String content = """
                Hello %s,

                This is a friendly reminder to take your prescribed medication:

                Medicine: %s
                Dosage: %s
                Frequency: %s
                Timing: %s
                Special Instructions: %s

                Stay healthy!
                """.formatted(
                patientName, item.getMedicineName(), item.getDosage(),
                item.getFrequency(), item.getTiming() != null ? item.getTiming() : "As directed",
                item.getInstructions() != null ? item.getInstructions() : "None"
        );

        queueAndSend(null, patientEmail, patientName, NotificationType.MEDICATION_REMINDER, subject, content);
    }

    @Transactional
    public void sendPostVisitSummary(Appointment appointment, String summary) {
        String patientEmail = appointment.getPatient().getEmail();
        String patientName = appointment.getPatient().getFullName();
        String doctorName = appointment.getDoctor().getUser().getFullName();
        String formattedDate = appointment.getAppointmentDate().format(DATE_FORMATTER);

        String subject = "Post-Visit Summary & Care Plan: Dr. " + doctorName;
        String content = """
                Dear %s,

                Thank you for your visit on %s. Here is your personalized care summary:

                %s

                Please review your prescribed medications in your patient dashboard.
                """.formatted(patientName, formattedDate, summary);

        queueAndSend(appointment.getId(), patientEmail, patientName, NotificationType.POST_VISIT_SUMMARY, subject, content);
    }

    private void queueAndSend(UUID appointmentId, String recipientEmail, String recipientName,
                              NotificationType type, String subject, String content) {
        NotificationLog log = new NotificationLog(appointmentId, recipientEmail, recipientName, type, subject, content);
        log = notificationLogRepository.save(log);

        dispatchNotificationAsync(log.getId());
    }

    @Async
    public void dispatchNotificationAsync(UUID logId) {
        NotificationLog log = notificationLogRepository.findById(logId).orElse(null);
        if (log == null) return;

        attemptDelivery(log);
    }

    public boolean attemptDelivery(NotificationLog log) {
        log.setLastAttemptAt(LocalDateTime.now());
        log.setRetryCount(log.getRetryCount() + 1);

        if (!mailEnabled || mailSender == null) {
            // Mock Mode: Log to console / database, mark as SENT
            logger.info(">>> [EMAIL NOTIFICATION MOCK DISPATCH] To: {} | Subject: '{}' | Type: {}",
                    log.getRecipientEmail(), log.getSubject(), log.getNotificationType());
            log.setStatus(NotificationStatus.SENT);
            log.setErrorMessage("Delivered in mock/console mode (mail service disabled).");
            notificationLogRepository.save(log);
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setFrom(mailFrom);
            helper.setTo(log.getRecipientEmail());
            helper.setSubject(log.getSubject());
            helper.setText(log.getContent(), false);

            mailSender.send(message);

            log.setStatus(NotificationStatus.SENT);
            log.setErrorMessage(null);
            notificationLogRepository.save(log);
            logger.info("Email delivered successfully to {}", log.getRecipientEmail());
            return true;
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", log.getRecipientEmail(), e.getMessage());
            log.setStatus(NotificationStatus.FAILED);
            log.setErrorMessage(e.getMessage());
            notificationLogRepository.save(log);
            return false;
        }
    }
}
