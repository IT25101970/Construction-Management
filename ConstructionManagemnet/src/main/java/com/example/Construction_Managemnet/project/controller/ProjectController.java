package com.example.Construction_Managemnet.project.controller;

import com.example.Construction_Managemnet.project.model.*;
import com.example.Construction_Managemnet.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getProjects(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String client,
            @RequestParam(required = false) ProjectStatus status) {

        if (keyword != null || client != null || status != null) {
            return ResponseEntity.ok(projectService.searchProjects(keyword, client, status));
        }
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectDto dto) {
        return new ResponseEntity<>(projectService.createProject(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDto dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        projectService.softDeleteProject(id);
        return ResponseEntity.ok(Map.of("message", "Project soft-deleted successfully", "id", id.toString()));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Project> archiveProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.archiveProject(id));
    }

    @PostMapping("/{id}/milestones")
    public ResponseEntity<Milestone> addMilestone(@PathVariable Long id, @Valid @RequestBody MilestoneDto dto) {
        return new ResponseEntity<>(projectService.addMilestone(id, dto), HttpStatus.CREATED);
    }

    @PutMapping("/milestones/{milestoneId}")
    public ResponseEntity<Milestone> updateMilestone(@PathVariable Long milestoneId, @Valid @RequestBody MilestoneDto dto) {
        return ResponseEntity.ok(projectService.updateMilestone(milestoneId, dto));
    }

    @DeleteMapping("/milestones/{milestoneId}")
    public ResponseEntity<Map<String, String>> deleteMilestone(@PathVariable Long milestoneId) {
        projectService.deleteMilestone(milestoneId);
        return ResponseEntity.ok(Map.of("message", "Milestone removed successfully", "id", milestoneId.toString()));
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<Map<String, Object>> getSummaryReport() {
        return ResponseEntity.ok(projectService.getProjectSummaryReport());
    }
}
