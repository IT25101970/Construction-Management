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
@Table(name = "inventory_materials")
public class Material extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String unit;

    @Column(name = "current_stock", nullable = false)
    private Double currentStock = 0.0;

    @Column(name = "reorder_level", nullable = false)
    private Double reorderLevel = 0.0;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice = 0.0;

    private String supplier;

    @Column(name = "is_low_stock", nullable = false)
    private Boolean isLowStock = false;

    private String location;

    @PrePersist
    @PreUpdate
    public void computeLowStock() {
        if (currentStock != null && reorderLevel != null) {
            this.isLowStock = currentStock <= reorderLevel;
        }
    }
}
