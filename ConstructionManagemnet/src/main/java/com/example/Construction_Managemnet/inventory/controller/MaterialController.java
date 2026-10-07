package com.example.Construction_Managemnet.inventory.controller;

import com.example.Construction_Managemnet.inventory.model.Material;
import com.example.Construction_Managemnet.inventory.model.MaterialStockLog;
import com.example.Construction_Managemnet.inventory.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public ResponseEntity<List<Material>> getAllMaterials() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<MaterialStockLog>> getStockLogs() {
        return ResponseEntity.ok(materialService.getAllStockLogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getMaterialById(id));
    }

    @PostMapping
    public ResponseEntity<Material> createMaterial(@jakarta.validation.Valid @RequestBody Material material) {
        return new ResponseEntity<>(materialService.createMaterial(material), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable Long id, @jakarta.validation.Valid @RequestBody Material material) {
        return ResponseEntity.ok(materialService.updateMaterial(id, material));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok(Map.of("message", "Material removed successfully", "id", id.toString()));
    }

    @PostMapping("/{id}/adjust")
    public ResponseEntity<Material> adjustStock(@PathVariable Long id, @jakarta.validation.Valid @RequestBody com.example.Construction_Managemnet.inventory.model.StockAdjustment adjustment) {
        return ResponseEntity.ok(materialService.adjustStock(id, adjustment));
    }
}
