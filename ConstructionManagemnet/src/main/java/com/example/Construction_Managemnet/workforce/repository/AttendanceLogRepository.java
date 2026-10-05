package com.example.Construction_Managemnet.workforce.repository;

import com.example.Construction_Managemnet.workforce.model.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
    List<AttendanceLog> findAllByOrderByCreatedAtDesc();
    List<AttendanceLog> findByWorkerIdOrderByCreatedAtDesc(Long workerId);
}
