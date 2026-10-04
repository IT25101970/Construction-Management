package com.example.Construction_Managemnet.task.model;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TaskDto {

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Assigned supervisor or worker is required")
    private String assignedTo;

    public String getAssignee() {
        return this.assignedTo;
    }

    public void setAssignee(String assignee) {
        if (this.assignedTo == null || this.assignedTo.isBlank()) {
            this.assignedTo = assignee;
        }
    }

    private TaskPriority priority = TaskPriority.MEDIUM;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private TaskStatus status = TaskStatus.TODO;

    @Min(0)
    @Max(100)
    private Integer progressPercentage = 0;

    private String workNotes;
}
