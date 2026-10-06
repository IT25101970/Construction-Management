package com.example.Construction_Managemnet.finance.model;

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
@Table(name = "finance_expenses")
public class Expense extends BaseEntity {

    @Column(name = "voucher_no", nullable = false)
    private String voucherNo;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "project_name")
    private String projectName;

    @Column(nullable = false)
    private String category; // Materials, Labour Wages, Subcontractor, Equipment Rental, Permits & Overheads

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(nullable = false)
    private String status = "APPROVED"; // APPROVED, PENDING, REJECTED
}
