package com.example.Construction_Managemnet.project.repository;

import com.example.Construction_Managemnet.project.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByProjectIdAndIsDeletedFalseOrderByTargetDateAsc(Long projectId);

    Optional<Milestone> findByIdAndIsDeletedFalse(Long id);
}
