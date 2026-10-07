package com.example.Construction_Managemnet.finance.repository;

import com.example.Construction_Managemnet.finance.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByIsDeletedFalseOrderByIdDesc();
    List<Expense> findByProjectIdAndIsDeletedFalse(Long projectId);
}
