package com.example.Construction_Managemnet.inventory.repository;

import com.example.Construction_Managemnet.inventory.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByIsDeletedFalseOrderByIdDesc();
}
