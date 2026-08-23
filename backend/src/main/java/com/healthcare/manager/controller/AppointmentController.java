package com.healthcare.manager.controller;

import com.healthcare.manager.dto.AppointmentDto;
import com.healthcare.manager.dto.ConfirmBookingRequest;
import com.healthcare.manager.dto.HoldSlotRequest;
import com.healthcare.manager.dto.HoldSlotResponse;
import com.healthcare.manager.entity.DoctorProfile;
import com.healthcare.manager.entity.Role;
import com.healthcare.manager.entity.User;
import com.healthcare.manager.repository.DoctorProfileRepository;
import com.healthcare.manager.service.AppointmentService;
import com.healthcare.manager.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AuthService authService;
    private final DoctorProfileRepository doctorProfileRepository;

    public AppointmentController(AppointmentService appointmentService,
                                 AuthService authService,
                                 DoctorProfileRepository doctorProfileRepository) {
        this.appointmentService = appointmentService;
        this.authService = authService;
        this.doctorProfileRepository = doctorProfileRepository;
    }

    @PostMapping("/hold")
    public ResponseEntity<HoldSlotResponse> holdSlot(@Valid @RequestBody HoldSlotRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(appointmentService.holdSlot(currentUser.getId(), request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<AppointmentDto> confirmBooking(@Valid @RequestBody ConfirmBookingRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(appointmentService.confirmBooking(currentUser.getId(), request));
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<List<AppointmentDto>> getMyAppointments() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(appointmentService.getPatientAppointments(currentUser.getId()));
    }

    @GetMapping("/doctor-appointments")
    public ResponseEntity<List<AppointmentDto>> getDoctorAppointments() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.DOCTOR && currentUser.getRole() != Role.ADMIN) {
            throw new IllegalStateException("Only doctors or admins can view doctor appointments");
        }
        DoctorProfile profile = doctorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Doctor profile not found"));
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(profile.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> getAppointmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancelAppointment(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        User currentUser = authService.getCurrentUser();
        String reason = body != null ? body.get("reason") : "User requested cancellation";
        appointmentService.cancelAppointment(id, currentUser.getId(), reason);
        return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully."));
    }

    @GetMapping("/ics/{id}")
    public ResponseEntity<String> downloadIcsFile(@PathVariable UUID id) {
        AppointmentDto appDto = appointmentService.getAppointmentById(id);
        // Build mock entity from DTO for ICS generation
        String icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Healthcare Manager//EN\nBEGIN:VEVENT\n" +
                "SUMMARY:Consultation with " + appDto.getDoctorName() + "\n" +
                "DESCRIPTION:Patient: " + appDto.getPatientName() + "\\nChief Complaint: " + (appDto.getAiChiefComplaint() != null ? appDto.getAiChiefComplaint() : "") + "\n" +
                "STATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"appointment-" + id + ".ics\"")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(icsContent);
    }
}
