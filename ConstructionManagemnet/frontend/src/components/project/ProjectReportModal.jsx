import React from 'react';
import { X, Printer } from 'lucide-react';

export default function ProjectReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  const {
    totalProjects = 0,
    plannedCount = 0,
    ongoingCount = 0,
    onHoldCount = 0,
    completedCount = 0,
    totalEstimatedBudget = 0,
    averageProgressPercentage = 0,
    projects = [],
  } = reportData;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '840px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Project Master & Summary Report</h3>
            <p className="page-subtitle">BuildTrack Executive Analytics & Milestone Progress</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print / Export PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="modal-body">
          {/* Summary KPIs */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
            <div className="stat-card">
              <span className="stat-title">Total Projects</span>
              <span className="stat-value">{totalProjects}</span>
              <span className="stat-desc">Registered portfolios</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Avg Completion</span>
              <span className="stat-value" style={{ color: 'var(--success)' }}>{averageProgressPercentage}%</span>
              <span className="stat-desc">Across all sites</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Ongoing Sites</span>
              <span className="stat-value" style={{ color: 'var(--info)' }}>{ongoingCount}</span>
              <span className="stat-desc">Active operations</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Committed Budget</span>
              <span className="stat-value" style={{ fontSize: '1.25rem' }}>
                Rs. {Number(totalEstimatedBudget).toLocaleString()} LKR
              </span>
              <span className="stat-desc">Total investment</span>
            </div>
          </div>

          {/* Status Breakdown Bar */}
          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: 8, border: '1px solid var(--border-color)', marginBottom: 20 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Status Distribution
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div><strong>Planned:</strong> {plannedCount}</div>
              <div><strong>Ongoing:</strong> {ongoingCount}</div>
              <div><strong>On-Hold:</strong> {onHoldCount}</div>
              <div><strong>Completed:</strong> {completedCount}</div>
            </div>
          </div>

          {/* Master Table */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Project Progress Matrix</h4>
          <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Timeline</th>
                  <th>Budget</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.location}</span></td>
                    <td>{p.client}</td>
                    <td style={{ fontSize: '0.8rem' }}>{p.startDate} &rarr; {p.endDate}</td>
                    <td>Rs. {Number(p.estimatedBudget).toLocaleString()}</td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-fill" style={{ width: `${p.progressPercentage}%` }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{p.progressPercentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close Report</button>
        </div>
      </div>
    </div>
  );
}
