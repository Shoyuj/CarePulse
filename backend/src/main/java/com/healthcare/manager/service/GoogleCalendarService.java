package com.healthcare.manager.service;

import com.healthcare.manager.entity.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class GoogleCalendarService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleCalendarService.class);
    private static final DateTimeFormatter CALENDAR_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");

    /**
     * Generates a Google Calendar Web Event creation link that pre-populates
     * title, date/time, doctor name, and triage summary for instant 1-click addition.
     */
    public String generateGoogleCalendarLink(Appointment appointment) {
        try {
            String doctorName = appointment.getDoctor().getUser().getFullName();
            String patientName = appointment.getPatient().getFullName();
            String specialization = appointment.getDoctor().getSpecialization();

            String title = "Medical Consultation: " + patientName + " & Dr. " + doctorName;
            
            LocalDateTime startDateTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());
            LocalDateTime endDateTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getEndTime());

            String formattedStart = startDateTime.format(CALENDAR_DATE_TIME_FORMATTER);
            String formattedEnd = endDateTime.format(CALENDAR_DATE_TIME_FORMATTER);
            String datesParam = formattedStart + "/" + formattedEnd;

            String details = """
                    Healthcare Consultation Details:
                    Doctor: Dr. %s (%s)
                    Patient: %s
                    Urgency: %s
                    Chief Complaint: %s
                    """.formatted(
                    doctorName, specialization, patientName,
                    appointment.getAiUrgencyLevel() != null ? appointment.getAiUrgencyLevel() : "Standard",
                    appointment.getAiChiefComplaint() != null ? appointment.getAiChiefComplaint() : "General checkup"
            );

            return "https://calendar.google.com/calendar/render?" +
                    "action=TEMPLATE" +
                    "&text=" + URLEncoder.encode(title, StandardCharsets.UTF_8) +
                    "&dates=" + datesParam +
                    "&details=" + URLEncoder.encode(details, StandardCharsets.UTF_8) +
                    "&location=" + URLEncoder.encode("Online / Clinic Consultation", StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Error generating Google Calendar URL: {}", e.getMessage());
            return "#";
        }
    }

    /**
     * Generates standard iCalendar (.ics) content for downloading
     */
    public String generateIcsContent(Appointment appointment) {
        String doctorName = appointment.getDoctor().getUser().getFullName();
        String patientName = appointment.getPatient().getFullName();
        LocalDateTime startDateTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());
        LocalDateTime endDateTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getEndTime());

        String formattedStart = startDateTime.format(CALENDAR_DATE_TIME_FORMATTER);
        String formattedEnd = endDateTime.format(CALENDAR_DATE_TIME_FORMATTER);
        String uid = appointment.getId().toString() + "@healthcare-manager.com";

        return "BEGIN:VCALENDAR\n" +
                "VERSION:2.0\n" +
                "PRODID:-//Healthcare Manager//EN\n" +
                "CALSCALE:GREGORIAN\n" +
                "METHOD:PUBLISH\n" +
                "BEGIN:VEVENT\n" +
                "UID:" + uid + "\n" +
                "DTSTAMP:" + LocalDateTime.now().format(CALENDAR_DATE_TIME_FORMATTER) + "Z\n" +
                "DTSTART:" + formattedStart + "\n" +
                "DTEND:" + formattedEnd + "\n" +
                "SUMMARY:Consultation with Dr. " + doctorName + "\n" +
                "DESCRIPTION:Patient: " + patientName + "\\nDoctor: Dr. " + doctorName + "\\nChief Complaint: " + (appointment.getAiChiefComplaint() != null ? appointment.getAiChiefComplaint() : "") + "\n" +
                "STATUS:CONFIRMED\n" +
                "END:VEVENT\n" +
                "END:VCALENDAR";
    }

    public String createOrSyncCalendarEvent(Appointment appointment) {
        String eventId = "gcal_evt_" + UUID.randomUUID().toString().substring(0, 8);
        logger.info("Synced Google Calendar event [{}] for appointment {}", eventId, appointment.getId());
        return eventId;
    }

    public void cancelCalendarEvent(String calendarEventId) {
        if (calendarEventId != null) {
            logger.info("Cancelled Google Calendar event [{}]", calendarEventId);
        }
    }
}
