package com.example.Construction_Managemnet.workforce.service;

import com.example.Construction_Managemnet.workforce.model.AttendanceLog;
import com.example.Construction_Managemnet.workforce.model.Worker;
import com.example.Construction_Managemnet.workforce.repository.AttendanceLogRepository;
import com.example.Construction_Managemnet.workforce.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkforceService {

    private final WorkerRepository workerRepository;
    private final AttendanceLogRepository attendanceLogRepository;

    public List<Worker> getAllWorkers() {
        List<Worker> workers = workerRepository.findByIsDeletedFalseOrderByIdDesc();
        workers.forEach(this::refreshMonthlyTotals);
        return workers;
    }

    public List<AttendanceLog> getAllAttendance() {
        return attendanceLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public Worker getWorkerById(Long id) {
        return workerRepository.findById(id).filter(record -> !Boolean.TRUE.equals(record.getIsDeleted()))
                .orElseThrow(() -> new com.example.Construction_Managemnet.common.exception.ResourceNotFoundException("Worker not found with ID: " + id));
    }

    @Transactional
    public Worker createWorker(Worker worker) {
        validateRate(worker.getDailyWageRate());
        worker.setId(null);
        worker.setIsDeleted(false);
        if (worker.getStatus() == null || worker.getStatus().isBlank()) {
            worker.setStatus("ACTIVE");
        }
        if (worker.getDaysPresentThisMonth() == null) {
            worker.setDaysPresentThisMonth(0);
        }
        if (worker.getTotalEarnedWage() == null) {
            worker.setTotalEarnedWage(0.0);
        }
        return workerRepository.save(worker);
    }

    @Transactional
    public Worker updateWorker(Long id, Worker updated) {
        validateRate(updated.getDailyWageRate());
        Worker existing = getWorkerById(id);
        existing.setFullName(updated.getFullName());
        existing.setNic(updated.getNic());
        existing.setTradeCategory(updated.getTradeCategory());
        existing.setDailyWageRate(updated.getDailyWageRate());
        existing.setPhone(updated.getPhone());
        existing.setAssignedSite(updated.getAssignedSite());
        existing.setStatus(updated.getStatus());
        return workerRepository.save(existing);
    }

    @Transactional
    public void deleteWorker(Long id) {
        Worker existing = getWorkerById(id);
        existing.setIsDeleted(true);
        workerRepository.save(existing);
    }

    @Transactional
    public AttendanceLog logAttendance(AttendanceLog log) {
        if (log.getWorkerId() == null || log.getDate() == null) throw new IllegalArgumentException("Worker and date are required");
        if (log.getDate().isAfter(java.time.LocalDate.now())) throw new IllegalArgumentException("Attendance date cannot be in the future");
        if (log.getStatus() == null || !java.util.Set.of("PRESENT", "ABSENT", "HALF_DAY").contains(log.getStatus())) {
            throw new IllegalArgumentException("Invalid attendance status");
        }
        Worker worker = workerRepository.findActiveForUpdate(log.getWorkerId())
                .orElseThrow(() -> new com.example.Construction_Managemnet.common.exception.ResourceNotFoundException("Worker not found"));
        if (!"ACTIVE".equals(worker.getStatus())) throw new IllegalArgumentException("Worker is not active");
        if (attendanceLogRepository.existsByWorkerIdAndDate(worker.getId(), log.getDate())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Attendance already exists for this worker and date");
        }
        double factor = "PRESENT".equals(log.getStatus()) ? 1.0 : "HALF_DAY".equals(log.getStatus()) ? 0.5 : 0.0;
        log.setId(null);
        log.setIsDeleted(false);
        log.setWorkerName(worker.getFullName());
        log.setTrade(worker.getTradeCategory());
        log.setHoursWorked((int) (8 * factor));
        log.setCalculatedWage(java.math.BigDecimal.valueOf(worker.getDailyWageRate()).multiply(java.math.BigDecimal.valueOf(factor)).setScale(2, java.math.RoundingMode.HALF_UP).doubleValue());
        AttendanceLog saved = attendanceLogRepository.save(log);
        refreshMonthlyTotals(worker);
        workerRepository.save(worker);
        return saved;
    }

    private void validateRate(Double rate) {
        if (rate == null || !Double.isFinite(rate) || rate < 0) throw new IllegalArgumentException("Wage rate must be non-negative and finite");
    }

    private void refreshMonthlyTotals(Worker worker) {
        java.time.LocalDate start = java.time.LocalDate.now().withDayOfMonth(1);
        List<AttendanceLog> logs = attendanceLogRepository.findByWorkerIdAndDateBetween(worker.getId(), start, start.plusMonths(1).minusDays(1));
        worker.setDaysPresentThisMonth((int) logs.stream().filter(log -> !Boolean.TRUE.equals(log.getIsDeleted()) && !"ABSENT".equals(log.getStatus())).count());
        worker.setTotalEarnedWage(logs.stream().filter(log -> !Boolean.TRUE.equals(log.getIsDeleted()))
                .map(log -> java.math.BigDecimal.valueOf(log.getCalculatedWage())).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add).doubleValue());
    }
}
