package com.healthcare.manager.repository;

import com.healthcare.manager.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {
    Optional<DoctorProfile> findByUserId(UUID userId);
    Optional<DoctorProfile> findByUserEmail(String email);

    @Query("SELECT d FROM DoctorProfile d JOIN d.user u WHERE " +
           "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.bio) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.qualification) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<DoctorProfile> searchDoctors(@Param("query") String query);
}
