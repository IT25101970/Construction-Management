package com.example.Construction_Managemnet.finance.controller;

import com.example.Construction_Managemnet.finance.model.Expense;
import com.example.Construction_Managemnet.finance.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(financeService.getAllExpenses());
    }

    @GetMapping("/budgets")
    public ResponseEntity<List<Map<String, Object>>> getBudgets() {
        return ResponseEntity.ok(financeService.getBudgets());
    }

    @PutMapping("/budgets/{projectId}")
    public ResponseEntity<Map<String, Object>> updateProjectBudget(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> body) {
        Double newBudget = Double.parseDouble(body.get("allocatedBudget").toString());
        return ResponseEntity.ok(financeService.updateProjectBudget(projectId, newBudget));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(financeService.getExpenseById(id));
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        return new ResponseEntity<>(financeService.createExpense(expense), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return ResponseEntity.ok(financeService.updateExpense(id, expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteExpense(@PathVariable Long id) {
        financeService.deleteExpense(id);
        return ResponseEntity.ok(Map.of("message", "Expense voucher voided successfully", "id", id.toString()));
    }
}
