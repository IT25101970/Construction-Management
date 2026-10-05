package com.example.Construction_Managemnet.workforce.repository;

import com.example.Construction_Managemnet.workforce.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findByIsDeletedFalseOrderByIdDesc();
}
