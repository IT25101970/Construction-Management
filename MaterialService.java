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
        return materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with ID: " + id));
    }

    @Transactional
    public Material createMaterial(Material material) {
        if (material.getCurrentStock() == null) material.setCurrentStock(0.0);
        if (material.getReorderLevel() == null) material.setReorderLevel(0.0);
        if (material.getUnitPrice() == null) material.setUnitPrice(0.0);
        material.computeLowStock();
        return materialRepository.save(material);
    }

    @Transactional
    public Material updateMaterial(Long id, Material updated) {
        Material existing = getMaterialById(id);
        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setUnit(updated.getUnit());
        existing.setCurrentStock(updated.getCurrentStock());
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
    public Material adjustStock(Long id, Map<String, Object> adjustment) {
        Material material = getMaterialById(id);
        double quantity = Double.parseDouble(adjustment.get("quantity").toString());
        String transactionType = adjustment.getOrDefault("transactionType", "STOCK_OUT").toString();
        String siteName = adjustment.getOrDefault("siteName", "").toString();
        String issuedTo = adjustment.getOrDefault("issuedTo", "").toString();
        String remarks = adjustment.getOrDefault("remarks", "").toString();

        double current = material.getCurrentStock() != null ? material.getCurrentStock() : 0.0;
        if ("STOCK_OUT".equalsIgnoreCase(transactionType)) {
            material.setCurrentStock(Math.max(0.0, current - quantity));
        } else {
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
}
