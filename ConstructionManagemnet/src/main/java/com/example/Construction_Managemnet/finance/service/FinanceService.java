package com.example.Construction_Managemnet.finance.service;

import com.example.Construction_Managemnet.finance.model.Expense;
import com.example.Construction_Managemnet.finance.repository.ExpenseRepository;
import com.example.Construction_Managemnet.project.model.Project;
import com.example.Construction_Managemnet.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final ExpenseRepository expenseRepository;
    private final ProjectRepository projectRepository;

    public List<Expense> getAllExpenses() {
        return expenseRepository.findByIsDeletedFalseOrderByIdDesc();
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id).filter(record -> !Boolean.TRUE.equals(record.getIsDeleted()))
                .orElseThrow(() -> new com.example.Construction_Managemnet.common.exception.ResourceNotFoundException("Expense record not found with ID: " + id));
    }

    @Transactional
    public Expense createExpense(Expense expense) {
        expense.setId(null);
        expense.setIsDeleted(false);
        if (expense.getStatus() == null || expense.getStatus().isBlank()) {
            expense.setStatus("APPROVED");
        }
        resolveProjectInfo(expense);
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense updateExpense(Long id, Expense updated) {
        Expense existing = getExpenseById(id);
        existing.setVoucherNo(updated.getVoucherNo());
        existing.setCategory(updated.getCategory());
        existing.setAmount(updated.getAmount());
        existing.setDate(updated.getDate());
        existing.setDescription(updated.getDescription());
        existing.setApprovedBy(updated.getApprovedBy());
        if (updated.getStatus() != null && !updated.getStatus().isBlank()) {
            existing.setStatus(updated.getStatus());
        }
        if (updated.getProjectId() != null) {
            existing.setProjectId(updated.getProjectId());
        }
        if (updated.getProjectName() != null && !updated.getProjectName().isBlank()) {
            existing.setProjectName(updated.getProjectName());
        }
        resolveProjectInfo(existing);
        return expenseRepository.save(existing);
    }

    private void resolveProjectInfo(Expense expense) {
        if (expense.getAmount() == null || !Double.isFinite(expense.getAmount()) || expense.getAmount() <= 0) {
            throw new IllegalArgumentException("Expense amount must be positive");
        }
        if (expense.getProjectId() == null) throw new IllegalArgumentException("Select a project");
        Project project = projectRepository.findByIdAndIsDeletedFalse(expense.getProjectId())
                .orElseThrow(() -> new com.example.Construction_Managemnet.common.exception.ResourceNotFoundException("Project not found"));
        expense.setProjectName(project.getName());
        if (!Set.of("APPROVED", "PENDING", "REJECTED").contains(expense.getStatus())) {
            throw new IllegalArgumentException("Invalid expense status");
        }
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense existing = getExpenseById(id);
        existing.setIsDeleted(true);
        expenseRepository.save(existing);
    }

    public List<Map<String, Object>> getBudgets() {
        List<Project> projects = projectRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
        List<Expense> allExpenses = expenseRepository.findByIsDeletedFalseOrderByIdDesc();

        List<Map<String, Object>> budgetList = new ArrayList<>();

        for (Project project : projects) {
            double allocated = project.getEstimatedBudget() != null ? project.getEstimatedBudget() : 0.0;
            double spent = allExpenses.stream()
                    .filter(e -> Objects.equals(e.getProjectId(), project.getId()) && "APPROVED".equals(e.getStatus()))
                    .map(e -> java.math.BigDecimal.valueOf(e.getAmount() != null ? e.getAmount() : 0.0))
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add).doubleValue();

            double remaining = java.math.BigDecimal.valueOf(allocated).subtract(java.math.BigDecimal.valueOf(spent)).doubleValue();
            int percentage = allocated > 0 ? (int) Math.round((spent / allocated) * 100) : 0;
            boolean overrun = percentage >= 90 || spent > allocated;

            Map<String, Object> budget = new HashMap<>();
            budget.put("projectId", project.getId());
            budget.put("projectName", project.getName());
            budget.put("allocatedBudget", allocated);
            budget.put("spentAmount", spent);
            budget.put("remainingBudget", remaining);
            budget.put("spentPercentage", percentage);
            budget.put("isOverrunWarning", overrun);

            budgetList.add(budget);
        }

        return budgetList;
    }

    @Transactional
    public Map<String, Object> updateProjectBudget(Long projectId, Double newBudget) {
        if (newBudget == null || !Double.isFinite(newBudget) || newBudget < 0) throw new IllegalArgumentException("Budget must be non-negative");
        Project project = projectRepository.findByIdAndIsDeletedFalse(projectId)
                .orElseThrow(() -> new com.example.Construction_Managemnet.common.exception.ResourceNotFoundException("Project not found with ID: " + projectId));
        project.setEstimatedBudget(newBudget);
        projectRepository.save(project);

        Map<String, Object> response = new HashMap<>();
        response.put("projectId", projectId);
        response.put("allocatedBudget", newBudget);
        response.put("message", "Master project budget ceiling updated successfully");
        return response;
    }
}
