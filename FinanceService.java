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
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense record not found with ID: " + id));
    }

    @Transactional
    public Expense createExpense(Expense expense) {
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
        if (expense.getProjectId() != null) {
            projectRepository.findByIdAndIsDeletedFalse(expense.getProjectId()).ifPresent(p -> {
                if (expense.getProjectName() == null || expense.getProjectName().isBlank()) {
                    expense.setProjectName(p.getName());
                }
            });
        } else if (expense.getProjectName() != null && !expense.getProjectName().isBlank()) {
            List<Project> matches = projectRepository.searchProjects(expense.getProjectName().trim(), null, null);
            if (!matches.isEmpty()) {
                expense.setProjectId(matches.get(0).getId());
                expense.setProjectName(matches.get(0).getName());
            } else {
                List<Project> all = projectRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
                if (!all.isEmpty()) {
                    expense.setProjectId(all.get(0).getId());
                }
            }
        } else {
            List<Project> all = projectRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
            if (!all.isEmpty()) {
                expense.setProjectId(all.get(0).getId());
                expense.setProjectName(all.get(0).getName());
            }
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
                    .filter(e -> Objects.equals(e.getProjectId(), project.getId()))
                    .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                    .sum();

            double remaining = Math.max(0.0, allocated - spent);
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
        Project project = projectRepository.findByIdAndIsDeletedFalse(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
        project.setEstimatedBudget(newBudget);
        projectRepository.save(project);
        
        Map<String, Object> response = new HashMap<>();
        response.put("projectId", projectId);
        response.put("allocatedBudget", newBudget);
        response.put("message", "Master project budget ceiling updated successfully");
        return response;
    }
}
