package com.healthcare.manager.service;

import com.healthcare.manager.dto.CreateDoctorRequest;
import com.healthcare.manager.dto.DoctorLeaveDto;
import com.healthcare.manager.dto.DoctorProfileDto;
import com.healthcare.manager.dto.DoctorSlotDto;
import com.healthcare.manager.entity.Appointment;
import com.healthcare.manager.entity.AppointmentStatus;
import com.healthcare.manager.entity.DoctorProfile;
import com.healthcare.manager.entity.Role;
import com.healthcare.manager.entity.User;
import com.healthcare.manager.repository.AppointmentRepository;
import com.healthcare.manager.repository.DoctorLeaveRepository;
import com.healthcare.manager.repository.DoctorProfileRepository;
import com.healthcare.manager.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorLeaveRepository doctorLeaveRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(DoctorProfileRepository doctorProfileRepository,
                         DoctorLeaveRepository doctorLeaveRepository,
                         AppointmentRepository appointmentRepository,
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder) {
        this.doctorProfileRepository = doctorProfileRepository;
        this.doctorLeaveRepository = doctorLeaveRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<DoctorProfileDto> getAllDoctors() {
        return doctorProfileRepository.findAll().stream()
                .map(DoctorProfileDto::fromEntity)
                .collect(Collectors.toList());
    }

    private static final java.util.Map<String, List<String>> SYMPTOM_SPECIALTY_MAP = java.util.Map.ofEntries(
            java.util.Map.entry("fever", List.of("General Medicine", "Pediatrics")),
            java.util.Map.entry("cold", List.of("General Medicine", "ENT", "Pulmonology")),
            java.util.Map.entry("flu", List.of("General Medicine", "Pulmonology")),
            java.util.Map.entry("dengue", List.of("General Medicine")),
            java.util.Map.entry("viral", List.of("General Medicine")),
            java.util.Map.entry("cough", List.of("Pulmonology", "General Medicine", "ENT")),
            java.util.Map.entry("asthma", List.of("Pulmonology")),
            java.util.Map.entry("breath", List.of("Pulmonology", "Cardiology")),
            java.util.Map.entry("chest pain", List.of("Cardiology", "Pulmonology")),
            java.util.Map.entry("heart", List.of("Cardiology")),
            java.util.Map.entry("bp", List.of("Cardiology", "General Medicine")),
            java.util.Map.entry("hypertension", List.of("Cardiology", "General Medicine")),
            java.util.Map.entry("skin", List.of("Dermatology")),
            java.util.Map.entry("rash", List.of("Dermatology")),
            java.util.Map.entry("acne", List.of("Dermatology")),
            java.util.Map.entry("hair", List.of("Dermatology")),
            java.util.Map.entry("itching", List.of("Dermatology")),
            java.util.Map.entry("knee", List.of("Orthopedics", "Physiotherapy")),
            java.util.Map.entry("joint", List.of("Orthopedics", "Rheumatology")),
            java.util.Map.entry("bone", List.of("Orthopedics")),
            java.util.Map.entry("back pain", List.of("Orthopedics", "Physiotherapy", "Neurology")),
            java.util.Map.entry("fracture", List.of("Orthopedics")),
            java.util.Map.entry("child", List.of("Pediatrics")),
            java.util.Map.entry("baby", List.of("Pediatrics")),
            java.util.Map.entry("infant", List.of("Pediatrics")),
            java.util.Map.entry("headache", List.of("Neurology", "General Medicine")),
            java.util.Map.entry("migraine", List.of("Neurology")),
            java.util.Map.entry("nerve", List.of("Neurology")),
            java.util.Map.entry("eye", List.of("Ophthalmology")),
            java.util.Map.entry("vision", List.of("Ophthalmology")),
            java.util.Map.entry("cataract", List.of("Ophthalmology")),
            java.util.Map.entry("period", List.of("Gynecology")),
            java.util.Map.entry("periods", List.of("Gynecology")),
            java.util.Map.entry("pcos", List.of("Gynecology")),
            java.util.Map.entry("pregnancy", List.of("Gynecology")),
            java.util.Map.entry("ear", List.of("ENT")),
            java.util.Map.entry("nose", List.of("ENT")),
            java.util.Map.entry("throat", List.of("ENT")),
            java.util.Map.entry("sinus", List.of("ENT")),
            java.util.Map.entry("stomach", List.of("Gastroenterology")),
            java.util.Map.entry("gas", List.of("Gastroenterology")),
            java.util.Map.entry("acidity", List.of("Gastroenterology")),
            java.util.Map.entry("vomiting", List.of("Gastroenterology", "General Medicine")),
            java.util.Map.entry("liver", List.of("Gastroenterology")),
            java.util.Map.entry("anxiety", List.of("Psychiatry")),
            java.util.Map.entry("depression", List.of("Psychiatry")),
            java.util.Map.entry("stress", List.of("Psychiatry")),
            java.util.Map.entry("sleep", List.of("Psychiatry")),
            java.util.Map.entry("diabetes", List.of("Endocrinology", "General Medicine")),
            java.util.Map.entry("sugar", List.of("Endocrinology", "General Medicine")),
            java.util.Map.entry("thyroid", List.of("Endocrinology")),
            java.util.Map.entry("kidney", List.of("Nephrology", "Urology")),
            java.util.Map.entry("teeth", List.of("Dental Surgery")),
            java.util.Map.entry("tooth", List.of("Dental Surgery")),
            java.util.Map.entry("dental", List.of("Dental Surgery")),
            java.util.Map.entry("cancer", List.of("Oncology")),
            java.util.Map.entry("tumor", List.of("Oncology")),
            java.util.Map.entry("stone", List.of("Urology", "General Surgery")),
            java.util.Map.entry("stones", List.of("Urology", "General Surgery")),
            java.util.Map.entry("hernia", List.of("General Surgery")),
            java.util.Map.entry("arthritis", List.of("Rheumatology", "Orthopedics")),
            java.util.Map.entry("pain", List.of("General Medicine", "Orthopedics", "Physiotherapy")),
            java.util.Map.entry("ayurveda", List.of("Ayurveda")),
            java.util.Map.entry("physiotherapy", List.of("Physiotherapy")),
            java.util.Map.entry("diet", List.of("Dietetics & Nutrition")),
            java.util.Map.entry("nutrition", List.of("Dietetics & Nutrition"))
    );

    public List<DoctorProfileDto> searchDoctors(String query) {
        if (query == null || query.isBlank()) {
            return getAllDoctors();
        }
        String cleanQuery = query.trim().toLowerCase();
        
        // 1. Direct database text search
        List<DoctorProfile> dbResults = doctorProfileRepository.searchDoctors(cleanQuery);
        java.util.LinkedHashSet<DoctorProfile> combinedResults = new java.util.LinkedHashSet<>(dbResults);

        // 2. Symptom keyword matching to medical specialties
        for (java.util.Map.Entry<String, List<String>> entry : SYMPTOM_SPECIALTY_MAP.entrySet()) {
            if (cleanQuery.contains(entry.getKey()) || entry.getKey().contains(cleanQuery)) {
                for (String specialty : entry.getValue()) {
                    List<DoctorProfile> specialtyDoctors = doctorProfileRepository.searchDoctors(specialty);
                    combinedResults.addAll(specialtyDoctors);
                }
            }
        }

        return combinedResults.stream()
                .map(DoctorProfileDto::fromEntity)
                .collect(Collectors.toList());
    }

    public DoctorProfileDto getDoctorById(UUID id) {
        DoctorProfile profile = doctorProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found: " + id));
        return DoctorProfileDto.fromEntity(profile);
    }

    public DoctorProfileDto getDoctorByUserId(UUID userId) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found for user: " + userId));
        return DoctorProfileDto.fromEntity(profile);
    }

    @Transactional
    public DoctorProfileDto createDoctor(CreateDoctorRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhone(),
                Role.DOCTOR
        );
        user = userRepository.save(user);

        DoctorProfile profile = new DoctorProfile(
                user,
                request.getSpecialization(),
                request.getQualification(),
                request.getWorkingHoursStart() != null ? request.getWorkingHoursStart() : LocalTime.of(9, 0),
                request.getWorkingHoursEnd() != null ? request.getWorkingHoursEnd() : LocalTime.of(17, 0),
                request.getSlotDurationMinutes() > 0 ? request.getSlotDurationMinutes() : 30,
                request.getConsultationFee(),
                request.getBio()
        );

        profile = doctorProfileRepository.save(profile);
        return DoctorProfileDto.fromEntity(profile);
    }

    @Transactional
    public DoctorProfileDto updateDoctor(UUID id, DoctorProfileDto dto) {
        DoctorProfile profile = doctorProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found: " + id));

        if (dto.getSpecialization() != null) profile.setSpecialization(dto.getSpecialization());
        if (dto.getQualification() != null) profile.setQualification(dto.getQualification());
        if (dto.getWorkingHoursStart() != null) profile.setWorkingHoursStart(dto.getWorkingHoursStart());
        if (dto.getWorkingHoursEnd() != null) profile.setWorkingHoursEnd(dto.getWorkingHoursEnd());
        if (dto.getSlotDurationMinutes() > 0) profile.setSlotDurationMinutes(dto.getSlotDurationMinutes());
        if (dto.getConsultationFee() != null) profile.setConsultationFee(dto.getConsultationFee());
        if (dto.getBio() != null) profile.setBio(dto.getBio());

        if (dto.getFullName() != null && profile.getUser() != null) {
            profile.getUser().setFullName(dto.getFullName());
            if (dto.getPhone() != null) profile.getUser().setPhone(dto.getPhone());
            userRepository.save(profile.getUser());
        }

        profile = doctorProfileRepository.save(profile);
        return DoctorProfileDto.fromEntity(profile);
    }

    public List<DoctorLeaveDto> getDoctorLeaves(UUID doctorId) {
        return doctorLeaveRepository.findByDoctorProfileIdOrderByLeaveDateAsc(doctorId).stream()
                .map(DoctorLeaveDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Calculates available, held, and booked slots for a given doctor on a given date.
     */
    public List<DoctorSlotDto> getDoctorSlotsForDate(UUID doctorId, LocalDate date, UUID currentUserId) {
        DoctorProfile doctor = doctorProfileRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorId));

        boolean isOnLeave = doctorLeaveRepository.existsByDoctorProfileIdAndLeaveDate(doctorId, date);
        if (isOnLeave) {
            return List.of(); // No slots available if doctor is on leave
        }

        LocalTime start = doctor.getWorkingHoursStart();
        LocalTime end = doctor.getWorkingHoursEnd();
        int slotMinutes = doctor.getSlotDurationMinutes() > 0 ? doctor.getSlotDurationMinutes() : 30;

        List<Appointment> existingAppointments = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
        LocalDateTime now = LocalDateTime.now();

        List<DoctorSlotDto> slots = new ArrayList<>();
        LocalTime current = start;

        while (current.plusMinutes(slotMinutes).compareTo(end) <= 0) {
            LocalTime slotStart = current;
            LocalTime slotEnd = current.plusMinutes(slotMinutes);

            // Find matching appointment for this slot
            Optional<Appointment> matching = existingAppointments.stream()
                    .filter(a -> a.getStartTime().equals(slotStart))
                    .findFirst();

            DoctorSlotDto slotDto = new DoctorSlotDto(slotStart, slotEnd, true, false, false);

            if (matching.isPresent()) {
                Appointment app = matching.get();
                if (app.getStatus() == AppointmentStatus.CONFIRMED || app.getStatus() == AppointmentStatus.COMPLETED) {
                    slotDto.setBooked(true);
                    slotDto.setAvailable(false);
                } else if (app.getStatus() == AppointmentStatus.HELD) {
                    if (app.getHoldExpiresAt() != null && app.getHoldExpiresAt().isAfter(now)) {
                        slotDto.setHeld(true);
                        slotDto.setAvailable(false);
                        if (currentUserId != null && app.getPatient() != null && currentUserId.equals(app.getPatient().getId())) {
                            slotDto.setHeldByCurrentUser(true);
                            long remainingSeconds = Duration.between(now, app.getHoldExpiresAt()).toSeconds();
                            slotDto.setHoldRemainingSeconds(Math.max(0, remainingSeconds));
                        }
                    } else {
                        // Hold expired
                        slotDto.setAvailable(true);
                    }
                }
            }

            // If date is today and slot is in the past
            if (date.equals(LocalDate.now()) && slotStart.isBefore(LocalTime.now())) {
                slotDto.setAvailable(false);
            }

            slots.add(slotDto);
            current = current.plusMinutes(slotMinutes);
        }

        return slots;
    }
}
