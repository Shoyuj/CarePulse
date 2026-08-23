package com.healthcare.manager.repository;

import com.healthcare.manager.entity.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, UUID> {
    List<DoctorLeave> findByDoctorProfileIdOrderByLeaveDateAsc(UUID doctorId);
    boolean existsByDoctorProfileIdAndLeaveDate(UUID doctorId, LocalDate leaveDate);
    Optional<DoctorLeave> findByDoctorProfileIdAndLeaveDate(UUID doctorId, LocalDate leaveDate);
}
