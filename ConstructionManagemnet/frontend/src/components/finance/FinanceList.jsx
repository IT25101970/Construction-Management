import React, { useState, useEffect } from 'react';
import { financeApi } from '../../api/financeApi';
import { projectApi } from '../../api/projectApi';
import {
  Plus, AlertTriangle, FileText,
  Trash2, Edit3
} from 'lucide-react';

export default function FinanceList() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);

  const [formData, setFormData] = useState({
    voucherNo: '',
    projectId: '',
    projectName: '',
    category: 'Materials',
    amount: 25000.00,
    date: new Date().toISOString().split('T')[0],
    description: '',
    approvedBy: 'Finance PM',
    status: 'APPROVED'
  });

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    return Promise.all([financeApi.getAllExpenses(), financeApi.getBudgets(), projectApi.getAll()])
      .then(([expData, budgetData, projData]) => {
        setExpenses(expData || []);
        setBudgets(budgetData || []);
        setProjects(projData || []);
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  };

  const [errors, setErrors] = useState({});

  const overrunBudgets = budgets.filter(b => b.isOverrunWarning || b.spentPercentage >= 80);

  const validateForm = () => {
    const errs = {};
    if (!formData.voucherNo.trim()) errs.voucherNo = 'Voucher number is required';
    if (!formData.projectId) errs.projectName = 'Please select a linked project';
    if (!formData.amount || Number(formData.amount) <= 0) errs.amount = 'Amount must be greater than zero LKR';
    if (!formData.date) errs.date = 'Voucher date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = {
        ...formData,
        projectId: formData.projectId ? Number(formData.projectId) : null,
        amount: Number(formData.amount),
      };
      if (editingExpense) {
        await financeApi.updateExpense(editingExpense.id, payload);
      } else {
        await financeApi.createExpense(payload);
      }
      await loadData();
      setShowAddModal(false);
      setEditingExpense(null);
      setErrors({});
    } catch (err) {
      console.error('Failed to save expense:', err);
      alert('Error saving expense to database: ' + (err.message || 'Server error'));
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!editingBudget || !editingBudget.projectId) return;
    try {
      await financeApi.updateBudget(editingBudget.projectId, Number(editingBudget.allocatedBudget));
      await loadData();
      setShowBudgetModal(false);
      setEditingBudget(null);
    } catch (err) {
      console.error('Failed to update project budget:', err);
      alert('Error updating master project budget: ' + (err.message || 'Server error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Void and delete this expense voucher record?')) {
      try {
        await financeApi.deleteExpense(id);
        loadData();
      } catch (err) {
        console.error('Failed to delete expense:', err);
        alert('Error voiding expense record: ' + (err.message || 'Server error'));
      }
    }
  };

  const filteredExpenses = expenses.filter(ex => {
    const matchesSearch = ex.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
                          (ex.description || '').toLowerCase().includes(search.toLowerCase()) ||
                          (ex.projectName || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || ex.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalSpent = expenses.filter(expense => expense.status === 'APPROVED').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  if (loading) return <div className="content-area" role="status">Loading records...</div>;

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div className="gsi-section-header" style={{ marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 18 }}>
        <div>
          <h1 className="gsi-headline" style={{ fontSize: '2rem', margin: 0 }}>
            Budget & Expense <span>Management</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 4 }}>
            Expenditure vouchers, category allocations, budget variance tracking, and cost overrun warning alerts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setShowReportModal(true)}>
            <FileText size={16} /> Budget Allocation Report
          </button>
          <button className="btn-gsi-gold" onClick={() => {
            setEditingExpense(null);
            setFormData({
              voucherNo: `EX-${Date.now().toString().slice(-4)}`,
              projectId: projects.length > 0 ? projects[0].id : '',
              projectName: projects.length > 0 ? projects[0].name : '',
              category: 'Materials',
              amount: 25000.00,
              date: new Date().toISOString().split('T')[0],
              description: '',
              approvedBy: 'Finance PM',
              status: 'APPROVED'
            });
            setShowAddModal(true);
          }}>
            <Plus size={16} /> Record Expense
          </button>
        </div>
      </div>

      {/* Overrun Warning Alert Banner */}
      {overrunBudgets.length > 0 && (
        <div style={{ padding: '16px 20px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
          <AlertTriangle size={24} color="var(--danger)" />
          <div>
            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.92rem' }}>
              Automated Cost Warning: {overrunBudgets.length} Projects Approaching / Exceeding Allocated Budget Ceiling!
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Budget overrun alerts active for: {overrunBudgets.map(b => `${b.projectName} (${b.spentPercentage}% spent)`).join(', ')}.
            </div>
          </div>
        </div>
      )}

      {/* Budget Vs Actual Spending Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
        {budgets.map((b, idx) => (
          <div key={idx} className="table-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>{b.projectName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Master Budget Ceiling</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className={`badge badge-${b.isOverrunWarning ? 'failed' : 'passed'}`}>
                  {b.spentPercentage}% Spent
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={() => {
                    setEditingBudget({
                      projectId: b.projectId,
                      projectName: b.projectName,
                      allocatedBudget: b.allocatedBudget || 0
                    });
                    setShowBudgetModal(true);
                  }}
                  title="Edit Master Allocated Budget"
                >
                  <Edit3 size={12} /> Edit
                </button>
              </div>
            </div>

            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold-primary)', marginBottom: 10 }}>
              Rs. {(b.spentAmount / 1000000).toFixed(2)}M / Rs. {(b.allocatedBudget / 1000000).toFixed(2)}M LKR
            </div>

            <div className="progress-bar-wrap" style={{ height: 10, marginBottom: 8 }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, b.spentPercentage)}%`,
                  background: b.isOverrunWarning ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : undefined
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Remaining: Rs. {(b.remainingBudget / 1000000).toFixed(2)}M LKR</span>
              <span>Allocated: 100%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Expense Vouchers Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by voucher #, description, project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="Materials">Materials</option>
              <option value="Labour Wages">Labour Wages</option>
              <option value="Subcontractor">Subcontractor</option>
              <option value="Equipment Rental">Equipment Rental</option>
            </select>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {filteredExpenses.length} expense vouchers
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Voucher # & Project</th>
                <th>Expense Category</th>
                <th>Amount (LKR)</th>
                <th>Voucher Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((ex) => (
                <tr key={ex.id}>
                  <td>
                    <strong style={{ color: 'var(--gold-primary)' }}>{ex.voucherNo}</strong>
                    <br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.projectName}</span>
                  </td>
                  <td><span className="badge badge-ongoing">{ex.category}</span></td>
                  <td style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
                    Rs. {Number(ex.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{ex.date}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 220 }}>{ex.description}</td>
                  <td>
                    <span className={`badge badge-${ex.status === 'APPROVED' ? 'passed' : 'pending'}`}>
                      {ex.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        setEditingExpense(ex);
                        setFormData({
                          voucherNo: ex.voucherNo || '',
                          projectId: ex.projectId || '',
                          projectName: ex.projectName || '',
                          category: ex.category || 'Materials',
                          amount: ex.amount || 0,
                          date: ex.date || '',
                          description: ex.description || '',
                          approvedBy: ex.approvedBy || '',
                          status: ex.status || 'APPROVED'
                        });
                        setShowAddModal(true);
                      }}>
                        <Edit3 size={14} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ex.id)}>
                        <Trash2 size={14} /> Void
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{editingExpense ? 'Edit Expense Voucher' : 'Record New Expense Voucher'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveExpense}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Voucher Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.voucherNo}
                      onChange={(e) => setFormData({ ...formData, voucherNo: e.target.value })}
                    />
                    {errors.voucherNo && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.voucherNo}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Linked Project Site *</label>
                    <select
                      className="form-select"
                      required
                      value={formData.projectId}
                      onChange={(e) => {
                        const pId = Number(e.target.value);
                        const p = projects.find(proj => proj.id === pId);
                        setFormData({
                          ...formData,
                          projectId: pId,
                          projectName: p ? p.name : ''
                        });
                      }}
                    >
                      <option value="">-- Select Project --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                      ))}
                    </select>
                    {errors.projectName && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.projectName}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expense Category *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Materials">Materials</option>
                      <option value="Labour Wages">Labour Wages</option>
                      <option value="Subcontractor">Subcontractor</option>
                      <option value="Equipment Rental">Equipment Rental</option>
                      <option value="Overheads">Overheads</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (LKR) *</label>
                    <input
                      type="number"
                      step="100.00"
                      className="form-input"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    />
                    {errors.amount && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.amount}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Voucher Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    {errors.date && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.date}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Approval Status *</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending Approval</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Receipt Notes</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-gsi-gold" style={{ padding: '8px 24px', borderRadius: 4, fontSize: '0.82rem' }}>
                  {editingExpense ? 'Update Voucher' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Variance Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Project Budget Variance & Expense Breakdown Report</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: 16, background: 'var(--bg-main)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: 8 }}>Executive Financial Ledger Metrics</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>Rs. {(totalSpent / 1000000).toFixed(2)}M LKR</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Logged Expenses</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--danger)' }}>
                      {overrunBudgets.length}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Overrun Warnings</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
              <button className="btn-gsi-gold" style={{ padding: '8px 20px', borderRadius: 4, fontSize: '0.8rem' }} onClick={() => alert('PDF Budget Variance Report generated!')}>
                Export PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Master Project Budget Modal */}
      {showBudgetModal && editingBudget && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Edit Master Project Budget Ceiling</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowBudgetModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveBudget}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    className="form-input"
                    disabled
                    value={editingBudget.projectName}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Allocated Master Budget Ceiling (LKR) *</label>
                  <input
                    type="number"
                    step="100000.00"
                    className="form-input"
                    required
                    value={editingBudget.allocatedBudget}
                    onChange={(e) => setEditingBudget({ ...editingBudget, allocatedBudget: e.target.value })}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Current Allocation: Rs. {(Number(editingBudget.allocatedBudget) / 1000000).toFixed(2)} Million LKR
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBudgetModal(false)}>Cancel</button>
                <button type="submit" className="btn-gsi-gold" style={{ padding: '8px 24px', borderRadius: 4, fontSize: '0.82rem' }}>
                  Update Budget Ceiling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
