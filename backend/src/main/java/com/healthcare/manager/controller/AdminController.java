package com.healthcare.manager.controller;

import com.healthcare.manager.dto.*;
import com.healthcare.manager.repository.NotificationLogRepository;
import com.healthcare.manager.service.AppointmentService;
import com.healthcare.manager.service.DoctorService;
import com.healthcare.manager.service.SchedulerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final NotificationLogRepository notificationLogRepository;
    private final SchedulerService schedulerService;
    private final com.healthcare.manager.service.AiRateLimiterService aiRateLimiterService;

    public AdminController(DoctorService doctorService,
                           AppointmentService appointmentService,
                           NotificationLogRepository notificationLogRepository,
                           SchedulerService schedulerService,
                           com.healthcare.manager.service.AiRateLimiterService aiRateLimiterService) {
        this.doctorService = doctorService;
        this.appointmentService = appointmentService;
        this.notificationLogRepository = notificationLogRepository;
        this.schedulerService = schedulerService;
        this.aiRateLimiterService = aiRateLimiterService;
    }

    @PostMapping("/doctors")
    public ResponseEntity<DoctorProfileDto> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        return ResponseEntity.ok(doctorService.createDoctor(request));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<DoctorProfileDto> updateDoctor(
            @PathVariable UUID id,
            @RequestBody DoctorProfileDto request) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, request));
    }

    @PostMapping("/doctors/{id}/leaves")
    public ResponseEntity<DoctorLeaveDto> applyDoctorLeave(
            @PathVariable UUID id,
            @RequestBody DoctorLeaveDto request) {
        return ResponseEntity.ok(appointmentService.applyDoctorLeave(id, request.getLeaveDate(), request.getReason()));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDto>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationLogDto>> getNotificationLogs() {
        return ResponseEntity.ok(notificationLogRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(NotificationLogDto::fromEntity)
                .collect(Collectors.toList()));
    }

    @PostMapping("/scheduler/trigger-reminders")
    public ResponseEntity<Map<String, Object>> triggerMedicationReminders() {
        int dispatched = schedulerService.triggerMedicationRemindersNow();
        return ResponseEntity.ok(Map.of(
                "message", "Medication reminder background job executed successfully.",
                "remindersDispatched", dispatched
        ));
    }

    @GetMapping("/ai-usage")
    public ResponseEntity<AiUsageStatsDto> getAiUsageStats() {
        return ResponseEntity.ok(aiRateLimiterService.getUsageStats());
    }
}
