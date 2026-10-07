package com.example.Construction_Managemnet.inventory.repository;

import com.example.Construction_Managemnet.inventory.model.MaterialStockLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialStockLogRepository extends JpaRepository<MaterialStockLog, Long> {
    List<MaterialStockLog> findAllByOrderByCreatedAtDesc();
}
