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
        return workerRepository.findByIsDeletedFalseOrderByIdDesc();
    }

    public List<AttendanceLog> getAllAttendance() {
        return attendanceLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public Worker getWorkerById(Long id) {
        return workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with ID: " + id));
    }

    @Transactional
    public Worker createWorker(Worker worker) {
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
        Worker existing = getWorkerById(id);
        existing.setFullName(updated.getFullName());
        existing.setNic(updated.getNic());
        existing.setTradeCategory(updated.getTradeCategory());
        existing.setDailyWageRate(updated.getDailyWageRate());
        existing.setPhone(updated.getPhone());
        existing.setAssignedSite(updated.getAssignedSite());
        existing.setStatus(updated.getStatus());
        if (updated.getDaysPresentThisMonth() != null) {
            existing.setDaysPresentThisMonth(updated.getDaysPresentThisMonth());
        }
        if (updated.getTotalEarnedWage() != null) {
            existing.setTotalEarnedWage(updated.getTotalEarnedWage());
        }
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
        if (log.getWorkerId() != null) {
            workerRepository.findById(log.getWorkerId()).ifPresent(worker -> {
                boolean isPresent = "PRESENT".equalsIgnoreCase(log.getStatus());
                double rate = worker.getDailyWageRate() != null ? worker.getDailyWageRate() : 0.0;
                double wage = isPresent ? rate : 0.0;
                log.setCalculatedWage(wage);
                log.setWorkerName(worker.getFullName());
                log.setTrade(worker.getTradeCategory());

                if (isPresent) {
                    int days = (worker.getDaysPresentThisMonth() != null ? worker.getDaysPresentThisMonth() : 0) + 1;
                    worker.setDaysPresentThisMonth(days);
                    worker.setTotalEarnedWage(days * rate);
                    workerRepository.save(worker);
                }
            });
        }
        return attendanceLogRepository.save(log);
    }
}
