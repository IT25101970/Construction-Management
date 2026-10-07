package com.example.Construction_Managemnet.inventory.repository;

import com.example.Construction_Managemnet.inventory.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByIsDeletedFalseOrderByIdDesc();
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select e from Material e where e.id = :id and e.isDeleted = false")
    java.util.Optional<Material> findActiveForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
}
