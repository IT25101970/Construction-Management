package com.example.Construction_Managemnet.task.model;

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
@Table(name = "site_tasks")
public class TaskItem extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"milestones", "hibernateLazyInitializer", "handler"})
    private Project project;

    @Column(name = "assigned_to", nullable = false)
    private String assignedTo;

    public String getAssignee() {
        return this.assignedTo;
    }

    public void setAssignee(String assignee) {
        this.assignedTo = assignee;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.TODO;

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0;

    @Column(name = "work_notes", columnDefinition = "TEXT")
    private String workNotes;

    @Column(name = "is_overdue", nullable = false)
    private Boolean isOverdue = false;
}
