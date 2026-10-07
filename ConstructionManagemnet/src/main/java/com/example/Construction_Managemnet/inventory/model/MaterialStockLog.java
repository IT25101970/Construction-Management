package com.example.Construction_Managemnet.inventory.model;

import com.example.Construction_Managemnet.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "inventory_stock_logs")
public class MaterialStockLog extends BaseEntity {

    @Column(name = "material_id", nullable = false)
    private Long materialId;

    @Column(name = "material_name", nullable = false)
    private String materialName;

    @Column(nullable = false)
    private Double quantity;

    @Column(name = "transaction_type", nullable = false)
    private String transactionType; // STOCK_IN, STOCK_OUT

    @Column(name = "site_name")
    private String siteName;

    @Column(name = "issued_to")
    private String issuedTo;

    @Column(nullable = false)
    private String date;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
