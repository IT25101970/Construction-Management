package com.example.Construction_Managemnet.task.controller;

import com.example.Construction_Managemnet.task.model.*;
import com.example.Construction_Managemnet.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskItem>> getTasks(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String assignee,
            @RequestParam(required = false) String keyword) {

        if (projectId != null || status != null || assignee != null || keyword != null) {
            return ResponseEntity.ok(taskService.searchTasks(projectId, status, assignee, keyword));
        }
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskItem> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskItem> createTask(@Valid @RequestBody TaskDto dto) {
        return new ResponseEntity<>(taskService.createTask(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskItem> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully", "id", id.toString()));
    }

    @GetMapping("/reports/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklyReport(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(taskService.getWeeklyTaskReport(projectId));
    }
}
