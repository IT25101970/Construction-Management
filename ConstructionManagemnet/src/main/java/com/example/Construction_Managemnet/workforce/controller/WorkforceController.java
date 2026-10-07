package com.example.Construction_Managemnet.workforce.controller;

import com.example.Construction_Managemnet.workforce.model.AttendanceLog;
import com.example.Construction_Managemnet.workforce.model.Worker;
import com.example.Construction_Managemnet.workforce.service.WorkforceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkforceController {

    private final WorkforceService workforceService;

    @GetMapping
    public ResponseEntity<List<Worker>> getAllWorkers() {
        return ResponseEntity.ok(workforceService.getAllWorkers());
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<AttendanceLog>> getAttendanceLogs() {
        return ResponseEntity.ok(workforceService.getAllAttendance());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Worker> getWorkerById(@PathVariable Long id) {
        return ResponseEntity.ok(workforceService.getWorkerById(id));
    }

    @PostMapping
    public ResponseEntity<Worker> createWorker(@jakarta.validation.Valid @RequestBody Worker worker) {
        return new ResponseEntity<>(workforceService.createWorker(worker), HttpStatus.CREATED);
    }

    @PostMapping("/attendance")
    public ResponseEntity<AttendanceLog> logAttendance(@RequestBody AttendanceLog attendanceLog) {
        return new ResponseEntity<>(workforceService.logAttendance(attendanceLog), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Worker> updateWorker(@PathVariable Long id, @jakarta.validation.Valid @RequestBody Worker worker) {
        return ResponseEntity.ok(workforceService.updateWorker(id, worker));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteWorker(@PathVariable Long id) {
        workforceService.deleteWorker(id);
        return ResponseEntity.ok(Map.of("message", "Worker record deleted successfully", "id", id.toString()));
    }
}
