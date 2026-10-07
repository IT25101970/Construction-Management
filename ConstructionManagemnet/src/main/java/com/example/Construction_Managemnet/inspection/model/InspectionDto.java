package com.example.Construction_Managemnet.inspection.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class InspectionDto {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Inspection stage is required")
    private InspectionStage stage;

    @NotBlank(message = "Inspector name is required")
    private String inspectorName;

    @NotNull(message = "Inspection date is required")
    private LocalDate inspectionDate;

    private InspectionStatus status = InspectionStatus.PENDING;

    private String checklistNotes;

    private String defectRemarks;

    private String correctiveActionNotes;

    private LocalDate followUpDate;
}
