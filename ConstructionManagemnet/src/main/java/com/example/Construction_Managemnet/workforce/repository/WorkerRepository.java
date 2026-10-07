package com.example.Construction_Managemnet.workforce.repository;

import com.example.Construction_Managemnet.workforce.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findByIsDeletedFalseOrderByIdDesc();
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select e from Worker e where e.id = :id and e.isDeleted = false")
    java.util.Optional<Worker> findActiveForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
}
