import React from 'react';
import { X, Printer, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export default function InspectionReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null;

  const {
    totalInspections = 0,
    passedCount = 0,
    failedCount = 0,
    pendingCount = 0,
    reInspectionsScheduled = 0,
    passRatePercentage = 0,
    openDefects = [],
  } = reportData;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '840px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Quality Inspection & Defect Summary Report</h3>
            <p className="page-subtitle">QA/QC Audit Compliance & Re-Inspection Tracking (F1b)</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={15} /> Print / Export PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="modal-body">
          {/* Summary KPIs */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
            <div className="stat-card">
              <span className="stat-title">Audits Performed</span>
              <span className="stat-value">{totalInspections}</span>
              <span className="stat-desc">Stage gates assessed</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">QA Pass Rate</span>
              <span className="stat-value" style={{ color: 'var(--success)' }}>{passRatePercentage}%</span>
              <span className="stat-desc">First-time compliance</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Failed Audits</span>
              <span className="stat-value" style={{ color: 'var(--danger)' }}>{failedCount}</span>
              <span className="stat-desc">Defects logged</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Re-Inspections</span>
              <span className="stat-value" style={{ color: 'var(--warning)' }}>{reInspectionsScheduled}</span>
              <span className="stat-desc">Triggered follow-ups</span>
            </div>
          </div>

          {/* Open Defects Section */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
            <AlertTriangle size={18} /> Outstanding Site Defect Log
          </h4>
          {openDefects.length === 0 ? (
            <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 8, color: '#166534', fontSize: '0.85rem', marginBottom: 16 }}>
              All quality inspections have met design standards. No open non-conformances.
            </div>
          ) : (
            <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: 8, marginBottom: 20 }}>
              <table>
                <thead>
                  <tr>
                    <th>Site Project</th>
                    <th>Stage</th>
                    <th>Audit Date</th>
                    <th>Defect Remarks</th>
                    <th>Corrective Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  {openDefects.map((d) => (
                    <tr key={d.id}>
                      <td><strong>{d.project ? d.project.name : 'N/A'}</strong></td>
                      <td><span className="badge badge-failed">{d.stage}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{d.inspectionDate}</td>
                      <td style={{ color: 'var(--danger)', fontSize: '0.84rem' }}>{d.defectRemarks}</td>
                      <td style={{ fontSize: '0.84rem' }}>{d.correctiveActionNotes || 'Pending supervisor sign-off'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close Report</button>
        </div>
      </div>
    </div>
  );
}
