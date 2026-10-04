package com.example.Construction_Managemnet.task.repository;

import com.example.Construction_Managemnet.task.model.TaskItem;
import com.example.Construction_Managemnet.task.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<TaskItem, Long> {

    List<TaskItem> findByIsDeletedFalseOrderByDueDateAsc();

    Optional<TaskItem> findByIdAndIsDeletedFalse(Long id);

    @Query("SELECT t FROM TaskItem t WHERE t.isDeleted = false AND " +
           "(:projectId IS NULL OR t.project.id = :projectId) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:assignee IS NULL OR LOWER(t.assignedTo) LIKE LOWER(CONCAT('%', :assignee, '%'))) AND " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY t.dueDate ASC")
    List<TaskItem> searchTasks(@Param("projectId") Long projectId,
                              @Param("status") TaskStatus status,
                              @Param("assignee") String assignee,
                              @Param("keyword") String keyword);

    List<TaskItem> findByIsDeletedFalseAndDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
}
