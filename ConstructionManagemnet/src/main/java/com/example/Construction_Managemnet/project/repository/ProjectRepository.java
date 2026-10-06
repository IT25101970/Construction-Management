package com.example.Construction_Managemnet.project.repository;

import com.example.Construction_Managemnet.project.model.Project;
import com.example.Construction_Managemnet.project.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByIsDeletedFalseOrderByCreatedAtDesc();

    Optional<Project> findByIdAndIsDeletedFalse(Long id);

    @Query("SELECT p FROM Project p WHERE p.isDeleted = false AND " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.location) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:client IS NULL OR LOWER(p.client) LIKE LOWER(CONCAT('%', :client, '%'))) AND " +
           "(:status IS NULL OR p.status = :status) " +
           "ORDER BY p.createdAt DESC")
    List<Project> searchProjects(@Param("keyword") String keyword,
                                 @Param("client") String client,
                                 @Param("status") ProjectStatus status);

    long countByIsDeletedFalse();

    long countByStatusAndIsDeletedFalse(ProjectStatus status);
}
