package com.example.Construction_Managemnet.workforce.model;

import com.example.Construction_Managemnet.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "workforce_workers")
public class Worker extends BaseEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String nic;

    @Column(name = "trade_category", nullable = false)
    private String tradeCategory; // Mason, Electrician, Plumber, Carpenter, Site Helper

    @Column(name = "daily_wage_rate", nullable = false)
    private Double dailyWageRate = 0.0;

    private String phone;

    @Column(name = "assigned_site")
    private String assignedSite;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, ON_LEAVE, INACTIVE

    @Column(name = "days_present_this_month", nullable = false)
    private Integer daysPresentThisMonth = 0;

    @Column(name = "total_earned_wage", nullable = false)
    private Double totalEarnedWage = 0.0;
}
