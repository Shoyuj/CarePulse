package com.healthcare.manager;

import com.healthcare.manager.dto.*;
import com.healthcare.manager.entity.*;
import com.healthcare.manager.repository.*;
import com.healthcare.manager.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class HealthcareWorkflowTests {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private SchedulerService schedulerService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User patient1;
    private User patient2;
    private DoctorProfile testDoctor;

    @BeforeEach
    void setup() {
        // Ensure clean test state with users
        if (userRepository.findByEmail("test.patient1@healthcare.com").isEmpty()) {
            patient1 = userRepository.save(new User("test.patient1@healthcare.com", passwordEncoder.encode("pass"), "Patient One", "111", Role.PATIENT));
        } else {
            patient1 = userRepository.findByEmail("test.patient1@healthcare.com").get();
        }

        if (userRepository.findByEmail("test.patient2@healthcare.com").isEmpty()) {
            patient2 = userRepository.save(new User("test.patient2@healthcare.com", passwordEncoder.encode("pass"), "Patient Two", "222", Role.PATIENT));
        } else {
            patient2 = userRepository.findByEmail("test.patient2@healthcare.com").get();
        }

        if (userRepository.findByEmail("test.doc@healthcare.com").isEmpty()) {
            User docUser = userRepository.save(new User("test.doc@healthcare.com", passwordEncoder.encode("pass"), "Dr. Test MD", "333", Role.DOCTOR));
            testDoctor = doctorProfileRepository.save(new DoctorProfile(
                    docUser, "Neurology", "MD", LocalTime.of(9, 0), LocalTime.of(17, 0), 30, BigDecimal.valueOf(150), "Neurologist"
            ));
        } else {
            testDoctor = doctorProfileRepository.findByUserEmail("test.doc@healthcare.com").get();
        }
    }

    @Test
    @DisplayName("Concurrency: Slot Hold & Double-Booking Prevention")
    void testSlotHoldAndDoubleBookingPrevention() {
        LocalDate date = LocalDate.now().plusDays(5);
        LocalTime startTime = LocalTime.of(14, 0);

        // 1. Patient 1 holds 14:00 slot
        HoldSlotRequest holdReq = new HoldSlotRequest();
        holdReq.setDoctorId(testDoctor.getId());
        holdReq.setAppointmentDate(date);
        holdReq.setStartTime(startTime);

        HoldSlotResponse holdResp = appointmentService.holdSlot(patient1.getId(), holdReq);
        assertNotNull(holdResp.getAppointmentId());
        assertEquals(AppointmentStatus.HELD, holdResp.getStatus());

        // 2. Patient 2 attempts to hold the EXACT SAME slot simultaneously -> Must throw Exception
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            appointmentService.holdSlot(patient2.getId(), holdReq);
        });
        assertTrue(exception.getMessage().contains("currently held by another patient") || exception.getMessage().contains("already been booked"));

        // 3. Patient 1 confirms booking with symptoms -> Pre-visit AI triage runs
        ConfirmBookingRequest confirmReq = new ConfirmBookingRequest(
                holdResp.getAppointmentId(),
                "Persistent throbbing migraine in right frontal lobe with light sensitivity for 3 days."
        );
        AppointmentDto confirmed = appointmentService.confirmBooking(patient1.getId(), confirmReq);

        assertEquals(AppointmentStatus.CONFIRMED, confirmed.getStatus());
        assertNotNull(confirmed.getAiUrgencyLevel());
        assertNotNull(confirmed.getAiChiefComplaint());
        assertFalse(confirmed.getAiSuggestedQuestions().isEmpty());

        // 4. After confirmation, Patient 2 attempts to hold -> Must fail with booked message
        assertThrows(IllegalStateException.class, () -> {
            appointmentService.holdSlot(patient2.getId(), holdReq);
        });
    }

    @Test
    @DisplayName("Doctor Leave: Conflict Detection & Cascade Cancellation")
    void testDoctorLeaveConflictCascade() {
        LocalDate leaveDate = LocalDate.now().plusDays(6);
        LocalTime slotTime = LocalTime.of(11, 0);

        // 1. Book an appointment for leaveDate
        HoldSlotRequest holdReq = new HoldSlotRequest();
        holdReq.setDoctorId(testDoctor.getId());
        holdReq.setAppointmentDate(leaveDate);
        holdReq.setStartTime(slotTime);

        HoldSlotResponse hold = appointmentService.holdSlot(patient1.getId(), holdReq);
        ConfirmBookingRequest confirmReq = new ConfirmBookingRequest(hold.getAppointmentId(), "Routine headache checkup");
        AppointmentDto app = appointmentService.confirmBooking(patient1.getId(), confirmReq);
        assertEquals(AppointmentStatus.CONFIRMED, app.getStatus());

        // 2. Admin applies Doctor Leave on leaveDate
        DoctorLeaveDto leaveDto = appointmentService.applyDoctorLeave(testDoctor.getId(), leaveDate, "Attending Medical Neurology Conference");

        assertTrue(leaveDto.getAffectedAppointmentsCount() >= 1);

        // 3. Verify appointment status is transitioned to CANCELLED_LEAVE
        Appointment updatedApp = appointmentRepository.findById(app.getId()).orElseThrow();
        assertEquals(AppointmentStatus.CANCELLED_LEAVE, updatedApp.getStatus());
    }

    @Test
    @DisplayName("Medication Reminders: Background Cron Job Execution")
    void testMedicationReminderBackgroundJob() {
        // Trigger background scheduler
        int remindersCount = schedulerService.triggerMedicationRemindersNow();
        assertTrue(remindersCount >= 0);
    }
}
