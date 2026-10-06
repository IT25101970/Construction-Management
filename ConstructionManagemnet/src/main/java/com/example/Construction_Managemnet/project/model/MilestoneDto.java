package com.example.Construction_Managemnet.project.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MilestoneDto {

    @NotBlank(message = "Milestone title is required")
    private String title;

    private String description;

    @NotNull(message = "Target date is required")
    private LocalDate targetDate;

    private MilestoneStatus status = MilestoneStatus.PENDING;
}
