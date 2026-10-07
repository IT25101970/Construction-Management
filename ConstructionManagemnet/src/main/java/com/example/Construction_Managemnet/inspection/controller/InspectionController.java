package com.example.Construction_Managemnet.inspection.controller;

import com.example.Construction_Managemnet.inspection.model.*;
import com.example.Construction_Managemnet.inspection.service.InspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @GetMapping
    public ResponseEntity<List<Inspection>> getInspections(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) InspectionStage stage,
            @RequestParam(required = false) InspectionStatus status) {

        if (projectId != null || stage != null || status != null) {
            return ResponseEntity.ok(inspectionService.searchInspections(projectId, stage, status));
        }
        return ResponseEntity.ok(inspectionService.getAllInspections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inspection> getInspectionById(@PathVariable Long id) {
        return ResponseEntity.ok(inspectionService.getInspectionById(id));
    }

    @PostMapping
    public ResponseEntity<Inspection> createInspection(@Valid @RequestBody InspectionDto dto) {
        return new ResponseEntity<>(inspectionService.createInspection(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inspection> updateInspection(@PathVariable Long id, @Valid @RequestBody InspectionDto dto) {
        return ResponseEntity.ok(inspectionService.updateInspection(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteInspection(@PathVariable Long id) {
        inspectionService.deleteInspection(id);
        return ResponseEntity.ok(Map.of("message", "Inspection log deleted successfully", "id", id.toString()));
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<Map<String, Object>> getSummaryReport() {
        return ResponseEntity.ok(inspectionService.getInspectionSummaryReport());
    }
}
