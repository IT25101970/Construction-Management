package com.example.Construction_Managemnet.inspection.model;

import com.example.Construction_Managemnet.common.model.BaseEntity;
import com.example.Construction_Managemnet.project.model.Project;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "quality_inspections")
public class Inspection extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"milestones", "hibernateLazyInitializer", "handler"})
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InspectionStage stage;

    @Column(name = "inspector_name", nullable = false)
    private String inspectorName;

    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InspectionStatus status = InspectionStatus.PENDING;

    @Column(name = "checklist_notes", columnDefinition = "TEXT")
    private String checklistNotes;

    @Column(name = "defect_remarks", columnDefinition = "TEXT")
    private String defectRemarks;

    @Column(name = "corrective_action_notes", columnDefinition = "TEXT")
    private String correctiveActionNotes;

    @Column(name = "is_re_inspection", nullable = false)
    private Boolean isReInspection = false;

    @Column(name = "original_inspection_id")
    private Long originalInspectionId;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
}
