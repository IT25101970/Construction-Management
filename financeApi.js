import { request } from './client';

export const financeApi = {
  getAllExpenses: () => request('/expenses'),
  getBudgets: () => request('/expenses/budgets'),
  createExpense: (expense) => request('/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  updateExpense: (id, expense) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expense) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  updateBudget: (projectId, allocatedBudget) => request(`/expenses/budgets/${projectId}`, { method: 'PUT', body: JSON.stringify({ allocatedBudget }) }),
};
