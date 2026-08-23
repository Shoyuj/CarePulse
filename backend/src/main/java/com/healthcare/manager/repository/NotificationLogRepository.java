package com.healthcare.manager.repository;

import com.healthcare.manager.entity.NotificationLog;
import com.healthcare.manager.entity.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {
    List<NotificationLog> findByStatusAndRetryCountLessThan(NotificationStatus status, int maxRetries);
    List<NotificationLog> findAllByOrderByCreatedAtDesc();
    List<NotificationLog> findByRecipientEmailOrderByCreatedAtDesc(String email);
    List<NotificationLog> findTop50ByOrderByCreatedAtDesc();
}
