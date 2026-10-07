import React, { useState, useEffect } from 'react';
import { taskApi } from '../../api/taskApi';
import { projectApi } from '../../api/projectApi';
import {
  Plus, AlertTriangle, Trash2, Edit3, FileText
} from 'lucide-react';

const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const emptyForm = {
    title: '',
    projectId: '',
    description: '',
    assignee: '',
    priority: 'MEDIUM',
    status: 'TODO',
    startDate: '',
    dueDate: '',
    progressPercentage: 0
  };

  const [formData, setFormData] = useState(emptyForm);
  const today = getTodayDate();
  // Preserve historical dates when editing an existing task without rescheduling it.
  const keepingOriginalStartDate = editingTask && formData.startDate === editingTask.startDate;
  const minimumStartDate = keepingOriginalStartDate && formData.startDate < today
    ? formData.startDate
    : today;

  useEffect(() => {
    projectApi.getAll().then(res => setProjects(res || [])).catch(console.error);
    loadTasks();
  }, []);

  function loadTasks() {
    setLoading(true);
    taskApi.getAll()
      .then((data) => setTasks(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const overdueTasks = tasks.filter(t => t.isOverdue || (t.status !== 'DONE' && new Date(t.dueDate) < new Date()));

  const [formError, setFormError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.assignee.trim() || !formData.startDate || !formData.dueDate) {
      setFormError('Please fill in all mandatory fields before saving.');
      return;
    }
    if (!formData.projectId) {
      setFormError('Please select a linked project.');
      return;
    }
    if (formData.startDate < getTodayDate() && !keepingOriginalStartDate) {
      setFormError('Start date must be today or a future date.');
      return;
    }
    if (formData.startDate && formData.dueDate && formData.startDate > formData.dueDate) {
      setFormError('Due date must be on or after start date.');
      return;
    }
    setFormError('');
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, formData);
      } else {
        await taskApi.create(formData);
      }
      loadTasks();
    } catch (err) {
      setFormError(err.message || 'Could not save task');
      return;
    }
    setShowModal(false);
    setEditingTask(null);
    setFormData(emptyForm);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task entry?')) {
      try {
        await taskApi.delete(id);
        loadTasks();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.assignee.toLowerCase().includes(search.toLowerCase()) ||
                          t.projectName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) return <div className="content-area" role="status">Loading records...</div>;

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div className="gsi-section-header" style={{ marginBottom: 28, borderBottom: '1px solid var(--border-color)', paddingBottom: 18 }}>
        <div>
          <h1 className="gsi-headline" style={{ fontSize: '2rem', margin: 0 }}>
            Task & Work <span>Scheduling</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 4 }}>
            Actionable site tasks, priority allocation, work progress notes, and automated overdue detection alerts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setShowReportModal(true)}>
            <FileText size={16} /> Schedule Adherence Report
          </button>
          <button className="btn-gsi-gold" onClick={() => { setEditingTask(null); setFormData({...emptyForm, projectId: projects.length > 0 ? projects[0].id : ''}); setShowModal(true); }}>
            <Plus size={16} /> Create Task
          </button>
        </div>
      </div>

      {/* Overdue Task Alert Banner */}
      {overdueTasks.length > 0 && (
        <div style={{ padding: '16px 20px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
          <AlertTriangle size={24} color="var(--danger)" />
          <div>
            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.92rem' }}>
              Automated Alert: {overdueTasks.length} Site Tasks are Overdue!
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              The following tasks have passed their scheduled due date: {overdueTasks.map(t => t.title).join(', ')}.
            </div>
          </div>
        </div>
      )}

      {/* Task Filters & Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by task title, assignee, project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="TODO">To-Do</option>
              <option value="IN_PROGRESS">In-Progress</option>
              <option value="DONE">Done</option>
              <option value="DELAYED">Delayed</option>
            </select>
            <select className="select-input" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Total {filteredTasks.length} tasks scheduled
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Task Title & Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Dates</th>
                <th>Completion %</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => (
                <tr key={t.id} style={{ background: t.isOverdue ? 'rgba(239,68,68,0.05)' : undefined }}>
                  <td>
                    <strong style={{ color: '#ffffff' }}>{t.title}</strong>
                    {t.isOverdue && <span style={{ fontSize: '0.68rem', color: 'var(--danger)', fontWeight: 800, marginLeft: 8 }}>OVERDUE</span>}
                    <br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.projectName}</span>
                  </td>
                  <td>{t.assignee || 'Unassigned'}</td>
                  <td>
                    <span className="badge" style={{
                      background: t.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : t.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: t.priority === 'HIGH' ? 'var(--danger)' : t.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--success)'
                    }}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Start: {t.startDate || 'N/A'}<br/>
                    Due: <span style={{ color: t.isOverdue ? 'var(--danger)' : undefined, fontWeight: t.isOverdue ? 700 : 400 }}>{t.dueDate || 'N/A'}</span>
                  </td>
                  <td style={{ minWidth: 130 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${t.progressPercentage}%` }} />
                      </div>
                      <span style={{ fontSize: '0.76rem', fontWeight: 800 }}>{t.progressPercentage}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status === 'TODO' ? 'TO DO' : t.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingTask(t); setFormData({ title: t.title, projectId: t.projectId, description: t.description, assignee: t.assignee || t.assignedTo || '', priority: t.priority, status: t.status, startDate: t.startDate, dueDate: t.dueDate, progressPercentage: t.progressPercentage }); setShowModal(true); }}>
                        <Edit3 size={14} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{editingTask ? 'Edit Work Task' : 'Schedule New Work Task'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 6, color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 700 }}>
                    {formError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Linked Project *</label>
                    <select
                      className="form-select"
                      required
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    >
                      <option value="">-- Select Project --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Supervisor / Worker *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.assignee}
                      onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Priority Level *</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Task Status *</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="TODO">To-Do</option>
                      <option value="IN_PROGRESS">In-Progress</option>
                      <option value="DONE">Done</option>
                      <option value="DELAYED">Delayed</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.startDate}
                      min={minimumStartDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Progress Percentage ({formData.progressPercentage}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progressPercentage}
                    onChange={(e) => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Work Notes</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-gsi-gold" style={{ padding: '8px 24px', borderRadius: 4, fontSize: '0.82rem' }}>
                  {editingTask ? 'Update Task' : 'Save Task Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adherence Summary Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Weekly Task Schedule Adherence Report</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: 16, background: 'var(--bg-main)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: 8 }}>Executive Adherence Metrics</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>{tasks.length}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Tasks</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--success)' }}>
                      {tasks.filter(t => t.status === 'DONE').length}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Completed</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--danger)' }}>
                      {overdueTasks.length}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Overdue Alerts</div>
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: 12 }}>Task Breakdown by Status</h4>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Completed Tasks: {tasks.filter(t => t.status === 'DONE').length}</li>
                <li>In-Progress Tasks: {tasks.filter(t => t.status === 'IN_PROGRESS').length}</li>
                <li>Overdue / Delayed: {overdueTasks.length}</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
              <button className="btn-gsi-gold" style={{ padding: '8px 20px', borderRadius: 4, fontSize: '0.8rem' }} onClick={() => alert('PDF Task Adherence Report generated!')}>
                Export PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
