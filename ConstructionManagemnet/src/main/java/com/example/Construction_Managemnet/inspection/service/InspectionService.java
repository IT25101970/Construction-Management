package com.example.Construction_Managemnet.inspection.service;

import com.example.Construction_Managemnet.common.exception.ResourceNotFoundException;
import com.example.Construction_Managemnet.inspection.model.*;
import com.example.Construction_Managemnet.inspection.repository.InspectionRepository;
import com.example.Construction_Managemnet.project.model.Project;
import com.example.Construction_Managemnet.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<Inspection> getAllInspections() {
        return inspectionRepository.findByIsDeletedFalseOrderByInspectionDateDesc();
    }

    @Transactional(readOnly = true)
    public List<Inspection> searchInspections(Long projectId, InspectionStage stage, InspectionStatus status) {
        return inspectionRepository.searchInspections(projectId, stage, status);
    }

    @Transactional(readOnly = true)
    public Inspection getInspectionById(Long id) {
        return inspectionRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with id: " + id));
    }

    public Inspection createInspection(InspectionDto dto) {
        Project project = projectRepository.findByIdAndIsDeletedFalse(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));

        Inspection inspection = new Inspection();
        mapDtoToEntity(dto, inspection, project);
        Inspection saved = inspectionRepository.save(inspection);

        // Check if created directly as FAILED -> Trigger automated re-inspection
        if (saved.getStatus() == InspectionStatus.FAILED) {
            triggerAutomatedReInspection(saved);
        }

        return saved;
    }

    public Inspection updateInspection(Long id, InspectionDto dto) {
        Inspection inspection = getInspectionById(id);
        Project project = projectRepository.findByIdAndIsDeletedFalse(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));

        InspectionStatus previousStatus = inspection.getStatus();
        mapDtoToEntity(dto, inspection, project);
        Inspection updated = inspectionRepository.save(inspection);

        // Automated Re-inspection Workflow:
        // Whenever an inspection status is marked "FAILED" from a non-failed state,
        // automatically schedule a follow-up re-inspection entry
        if (updated.getStatus() == InspectionStatus.FAILED && previousStatus != InspectionStatus.FAILED) {
            triggerAutomatedReInspection(updated);
        }

        return updated;
    }

    private void triggerAutomatedReInspection(Inspection failedInspection) {
        if (inspectionRepository.existsByOriginalInspectionIdAndStatusAndIsDeletedFalse(failedInspection.getId(), InspectionStatus.PENDING)) return;
        LocalDate nextDate = failedInspection.getFollowUpDate() != null
                ? failedInspection.getFollowUpDate()
                : (failedInspection.getInspectionDate().isAfter(LocalDate.now()) ? failedInspection.getInspectionDate() : LocalDate.now()).plusDays(5);

        Inspection reInspection = new Inspection();
        reInspection.setProject(failedInspection.getProject());
        reInspection.setStage(failedInspection.getStage());
        reInspection.setInspectorName(failedInspection.getInspectorName());
        reInspection.setInspectionDate(nextDate);
        reInspection.setStatus(InspectionStatus.PENDING);
        reInspection.setIsReInspection(true);
        reInspection.setOriginalInspectionId(failedInspection.getId());
        reInspection.setChecklistNotes("Follow-up Re-Inspection for audit #" + failedInspection.getId() + " (" + failedInspection.getStage() + ")");
        reInspection.setCorrectiveActionNotes("Pending verification of: " + (failedInspection.getDefectRemarks() != null ? failedInspection.getDefectRemarks() : "Identified site non-conformances"));

        inspectionRepository.save(reInspection);
    }

    public void deleteInspection(Long id) {
        Inspection inspection = getInspectionById(id);
        inspection.setIsDeleted(true);
        inspectionRepository.save(inspection);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInspectionSummaryReport() {
        List<Inspection> all = inspectionRepository.findByIsDeletedFalseOrderByInspectionDateDesc();
        long total = all.size();
        long passed = all.stream().filter(i -> i.getStatus() == InspectionStatus.PASSED).count();
        long failed = all.stream().filter(i -> i.getStatus() == InspectionStatus.FAILED).count();
        long pending = all.stream().filter(i -> i.getStatus() == InspectionStatus.PENDING).count();
        long reInspections = all.stream().filter(i -> Boolean.TRUE.equals(i.getIsReInspection())).count();

        double passRate = passed + failed > 0 ? ((double) passed / (passed + failed)) * 100.0 : 0.0;

        java.util.Set<Long> resolved = new java.util.HashSet<>();
        Map<Long, Inspection> byId = new HashMap<>();
        all.forEach(inspection -> byId.put(inspection.getId(), inspection));
        for (Inspection inspection : all) {
            if (inspection.getStatus() != InspectionStatus.PASSED) continue;
            Long original = inspection.getOriginalInspectionId();
            while (original != null && resolved.add(original)) {
                Inspection parent = byId.get(original);
                original = parent == null ? null : parent.getOriginalInspectionId();
            }
        }
        List<Inspection> openDefects = all.stream()
                .filter(i -> i.getStatus() == InspectionStatus.FAILED && !resolved.contains(i.getId()))
                .toList();

        Map<String, Object> report = new HashMap<>();
        report.put("totalInspections", total);
        report.put("passedCount", passed);
        report.put("failedCount", failed);
        report.put("pendingCount", pending);
        report.put("reInspectionsScheduled", reInspections);
        report.put("passRatePercentage", Math.round(passRate * 10.0) / 10.0);
        report.put("openDefects", openDefects);
        report.put("allInspections", all);

        return report;
    }

    private void mapDtoToEntity(InspectionDto dto, Inspection inspection, Project project) {
        if (dto.getFollowUpDate() != null && dto.getInspectionDate() != null && !dto.getFollowUpDate().isAfter(dto.getInspectionDate())) throw new IllegalArgumentException("Follow-up must be after the inspection date");
        inspection.setProject(project);
        inspection.setStage(dto.getStage());
        inspection.setInspectorName(dto.getInspectorName());
        inspection.setInspectionDate(dto.getInspectionDate());
        if (dto.getStatus() != null) {
            inspection.setStatus(dto.getStatus());
        }
        inspection.setChecklistNotes(dto.getChecklistNotes());
        inspection.setDefectRemarks(dto.getDefectRemarks());
        inspection.setCorrectiveActionNotes(dto.getCorrectiveActionNotes());
        inspection.setFollowUpDate(dto.getFollowUpDate());
    }
}
