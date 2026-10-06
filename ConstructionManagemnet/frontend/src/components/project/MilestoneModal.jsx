import React, { useState } from 'react';
import { X, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';

export default function MilestoneModal({ isOpen, onClose, project, onAddMilestone, onUpdateMilestone, onDeleteMilestone }) {
  const [newTitle, setNewTitle] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !project) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTargetDate) return;

    onAddMilestone(project.id, {
      title: newTitle,
      description: newDescription,
      targetDate: newTargetDate,
      status: 'PENDING',
    });

    setNewTitle('');
    setNewTargetDate('');
    setNewDescription('');
    setIsAdding(false);
  };

  const handleToggleStatus = (milestone) => {
    const nextStatus = milestone.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    onUpdateMilestone(milestone.id, {
      title: milestone.title,
      description: milestone.description,
      targetDate: milestone.targetDate,
      status: nextStatus,
    });
  };

  const milestones = project.milestones ? project.milestones.filter(m => !m.isDeleted) : [];

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Project Milestones</h3>
            <p className="page-subtitle">{project.name} &bull; Client: {project.client}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Milestones Defined: {milestones.length}
            </span>
            {!isAdding && (
              <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
                <Plus size={14} /> Add Milestone
              </button>
            )}
          </div>

          {isAdding && (
            <form onSubmit={handleCreate} style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)', marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10 }}>New Milestone Phase</h4>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Phase title, e.g. Foundation & Piling Completion"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-row" style={{ marginBottom: 8 }}>
                <input
                  type="date"
                  className="form-input"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optional deliverables / notes"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Milestone</button>
              </div>
            </form>
          )}

          {milestones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              No milestones defined yet. Click "Add Milestone" to establish target phase deadlines.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {milestones.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: m.status === 'COMPLETED' ? '#f0fdf4' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(m)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.status === 'COMPLETED' ? 'var(--success)' : '#94a3b8' }}
                    >
                      {m.status === 'COMPLETED' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: m.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Target: {m.targetDate} {m.description && `• ${m.description}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge badge-${m.status.toLowerCase()}`}>
                      {m.status}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)', padding: 6 }}
                      onClick={() => onDeleteMilestone(m.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
