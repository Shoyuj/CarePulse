package com.healthcare.manager.repository;

import com.healthcare.manager.entity.MedicationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationItemRepository extends JpaRepository<MedicationItem, UUID> {
    List<MedicationItem> findByPrescriptionId(UUID prescriptionId);

    @Query("SELECT m FROM MedicationItem m JOIN FETCH m.prescription p JOIN FETCH p.patient")
    List<MedicationItem> findAllWithPrescriptions();
}
