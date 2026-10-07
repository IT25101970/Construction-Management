package com.example.Construction_Managemnet.inspection.repository;

import com.example.Construction_Managemnet.inspection.model.Inspection;
import com.example.Construction_Managemnet.inspection.model.InspectionStage;
import com.example.Construction_Managemnet.inspection.model.InspectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {

    List<Inspection> findByIsDeletedFalseOrderByInspectionDateDesc();

    Optional<Inspection> findByIdAndIsDeletedFalse(Long id);

    @Query("SELECT i FROM Inspection i WHERE i.isDeleted = false AND " +
           "(:projectId IS NULL OR i.project.id = :projectId) AND " +
           "(:stage IS NULL OR i.stage = :stage) AND " +
           "(:status IS NULL OR i.status = :status) " +
           "ORDER BY i.inspectionDate DESC")
    List<Inspection> searchInspections(@Param("projectId") Long projectId,
                                      @Param("stage") InspectionStage stage,
                                      @Param("status") InspectionStatus status);

    long countByStatusAndIsDeletedFalse(InspectionStatus status);

    long countByIsDeletedFalse();
}
