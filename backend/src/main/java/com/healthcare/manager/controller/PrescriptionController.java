package com.healthcare.manager.controller;

import com.healthcare.manager.dto.PostVisitNotesRequest;
import com.healthcare.manager.dto.PrescriptionDto;
import com.healthcare.manager.entity.Role;
import com.healthcare.manager.entity.User;
import com.healthcare.manager.repository.PrescriptionRepository;
import com.healthcare.manager.service.AppointmentService;
import com.healthcare.manager.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final AppointmentService appointmentService;
    private final PrescriptionRepository prescriptionRepository;
    private final AuthService authService;

    public PrescriptionController(AppointmentService appointmentService,
                                  PrescriptionRepository prescriptionRepository,
                                  AuthService authService) {
        this.appointmentService = appointmentService;
        this.prescriptionRepository = prescriptionRepository;
        this.authService = authService;
    }

    @PostMapping("/{appointmentId}")
    public ResponseEntity<PrescriptionDto> submitClinicalNotes(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody PostVisitNotesRequest request) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.DOCTOR && currentUser.getRole() != Role.ADMIN) {
            throw new IllegalStateException("Only the attending doctor can submit clinical notes and prescriptions.");
        }
        return ResponseEntity.ok(appointmentService.submitClinicalNotes(currentUser.getId(), appointmentId, request));
    }

    @GetMapping("/my-prescriptions")
    public ResponseEntity<List<PrescriptionDto>> getMyPrescriptions() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(PrescriptionDto::fromEntity)
                .collect(Collectors.toList()));
    }

    @GetMapping("/by-appointment/{appointmentId}")
    public ResponseEntity<PrescriptionDto> getByAppointmentId(@PathVariable UUID appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId)
                .map(p -> ResponseEntity.ok(PrescriptionDto.fromEntity(p)))
                .orElse(ResponseEntity.notFound().build());
    }
}
