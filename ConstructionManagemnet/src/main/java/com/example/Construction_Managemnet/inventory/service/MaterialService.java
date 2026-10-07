package com.example.Construction_Managemnet.inventory.service;

import com.example.Construction_Managemnet.inventory.model.Material;
import com.example.Construction_Managemnet.inventory.model.MaterialStockLog;
import com.example.Construction_Managemnet.inventory.repository.MaterialRepository;
import com.example.Construction_Managemnet.inventory.repository.MaterialStockLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialStockLogRepository stockLogRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findByIsDeletedFalseOrderByIdDesc();
    }

    public List<MaterialStockLog> getAllStockLogs() {
        return stockLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public Material getMaterialById(Long id) {
        return materialRepository.findById(id).filter(record -> !Boolean.TRUE.equals(record.getIsDeleted()))
                .orElseThrow(() -> new com.example.Construction_Managemnet.common.exception.ResourceNotFoundException("Material not found with ID: " + id));
    }

    @Transactional
    public Material createMaterial(Material material) {
        material.setId(null);
        material.setIsDeleted(false);
        if (material.getCurrentStock() == null) material.setCurrentStock(0.0);
        if (material.getReorderLevel() == null) material.setReorderLevel(0.0);
        if (material.getUnitPrice() == null) material.setUnitPrice(0.0);
        validateMaterial(material);
        material.computeLowStock();
        return materialRepository.save(material);
    }

    @Transactional
    public Material updateMaterial(Long id, Material updated) {
        validateMaterial(updated);
        Material existing = materialRepository.findActiveForUpdate(id)
                .orElseThrow(() -> new com.example.Construction_Managemnet.common.exception.ResourceNotFoundException("Material not found"));
        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setUnit(updated.getUnit());
        if (updated.getCurrentStock() != null && !updated.getCurrentStock().equals(existing.getCurrentStock())) {
            throw new IllegalArgumentException("Use stock adjustment to change stock; catalog editing must preserve current quantity");
        }
        existing.setReorderLevel(updated.getReorderLevel());
        existing.setUnitPrice(updated.getUnitPrice());
        existing.setSupplier(updated.getSupplier());
        existing.setLocation(updated.getLocation());
        existing.computeLowStock();
        return materialRepository.save(existing);
    }

    @Transactional
    public void deleteMaterial(Long id) {
        Material material = getMaterialById(id);
        material.setIsDeleted(true);
        materialRepository.save(material);
    }

    @Transactional
    public Material adjustStock(Long id, com.example.Construction_Managemnet.inventory.model.StockAdjustment adjustment) {
        Material material = materialRepository.findActiveForUpdate(id)
                .orElseThrow(() -> new com.example.Construction_Managemnet.common.exception.ResourceNotFoundException("Material not found"));
        if (adjustment.quantity() == null || !Double.isFinite(adjustment.quantity()) || adjustment.quantity() <= 0
                || adjustment.transactionType() == null) {
            throw new IllegalArgumentException("Enter a positive quantity and valid transaction type");
        }
        double quantity = adjustment.quantity();
        String transactionType = adjustment.transactionType().name();
        String siteName = adjustment.siteName();
        String issuedTo = adjustment.issuedTo();
        String remarks = adjustment.remarks();
        double current = material.getCurrentStock();
        if ("STOCK_OUT".equals(transactionType)) {
            if (quantity > current) throw new IllegalArgumentException("Insufficient material stock");
            material.setCurrentStock(current - quantity);
        } else {
            if (!Double.isFinite(current + quantity)) throw new IllegalArgumentException("Stock exceeds supported range");
            material.setCurrentStock(current + quantity);
        }
        material.computeLowStock();
        Material saved = materialRepository.save(material);

        MaterialStockLog log = new MaterialStockLog();
        log.setMaterialId(saved.getId());
        log.setMaterialName(saved.getName());
        log.setQuantity(quantity);
        log.setTransactionType(transactionType);
        log.setSiteName(siteName);
        log.setIssuedTo(issuedTo);
        log.setDate(LocalDate.now().toString());
        log.setRemarks(remarks);
        stockLogRepository.save(log);

        return saved;
    }
    private void validateMaterial(Material material) {
        for (Double value : new Double[]{material.getCurrentStock(), material.getReorderLevel(), material.getUnitPrice()}) {
            if (value == null || !Double.isFinite(value) || value < 0) throw new IllegalArgumentException("Stock, reorder level and unit price must be non-negative and finite");
        }
    }
}
