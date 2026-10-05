package com.example.Construction_Managemnet.workforce.model;

import com.example.Construction_Managemnet.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "workforce_attendance_logs")
public class AttendanceLog extends BaseEntity {

    @Column(name = "worker_id", nullable = false)
    private Long workerId;

    @Column(name = "worker_name", nullable = false)
    private String workerName;

    private String trade;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "site_name")
    private String siteName;

    @Column(nullable = false)
    private String status = "PRESENT"; // PRESENT, ABSENT, HALF_DAY

    @Column(name = "hours_worked", nullable = false)
    private Integer hoursWorked = 8;

    @Column(name = "calculated_wage", nullable = false)
    private Double calculatedWage = 0.0;
}
