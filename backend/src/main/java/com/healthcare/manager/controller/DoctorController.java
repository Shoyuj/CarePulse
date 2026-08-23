package com.healthcare.manager.controller;

import com.healthcare.manager.dto.DoctorLeaveDto;
import com.healthcare.manager.dto.DoctorProfileDto;
import com.healthcare.manager.dto.DoctorSlotDto;
import com.healthcare.manager.entity.User;
import com.healthcare.manager.service.AuthService;
import com.healthcare.manager.service.DoctorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final AuthService authService;

    public DoctorController(DoctorService doctorService, AuthService authService) {
        this.doctorService = doctorService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<DoctorProfileDto>> getDoctors(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(doctorService.searchDoctors(search));
        }
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorProfileDto> getDoctorById(@PathVariable UUID id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/{id}/leaves")
    public ResponseEntity<List<DoctorLeaveDto>> getDoctorLeaves(@PathVariable UUID id) {
        return ResponseEntity.ok(doctorService.getDoctorLeaves(id));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<DoctorSlotDto>> getDoctorSlots(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        UUID currentUserId = null;
        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser != null) {
                currentUserId = currentUser.getId();
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(doctorService.getDoctorSlotsForDate(id, date, currentUserId));
    }
}
