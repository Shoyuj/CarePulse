package com.healthcare.manager.repository;

import com.healthcare.manager.entity.Appointment;
import com.healthcare.manager.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByPatientIdOrderByAppointmentDateDescStartTimeDesc(UUID patientId);

    List<Appointment> findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(UUID doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDate(UUID doctorId, LocalDate appointmentDate);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :date " +
           "AND (a.status = 'CONFIRMED' OR (a.status = 'HELD' AND a.holdExpiresAt > :now)) " +
           "AND (a.startTime < :endTime AND a.endTime > :startTime)")
    List<Appointment> findConflictingAppointments(
            @Param("doctorId") UUID doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("now") LocalDateTime now);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :date " +
           "AND a.status IN ('CONFIRMED', 'HELD')")
    List<Appointment> findActiveAppointmentsForDoctorOnDate(
            @Param("doctorId") UUID doctorId,
            @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.status = 'HELD' AND a.holdExpiresAt <= :now")
    List<Appointment> findExpiredHolds(@Param("now") LocalDateTime now);

    List<Appointment> findByStatusAndAppointmentDate(AppointmentStatus status, LocalDate appointmentDate);
}
