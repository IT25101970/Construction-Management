import React, { useState, useEffect } from 'react';
import { inspectionApi } from '../../api/inspectionApi';
import { projectApi } from '../../api/projectApi';
import InspectionModal from './InspectionModal';
import InspectionReportModal from './InspectionReportModal';
import {
  ClipboardCheck, Plus, Search, Filter, BarChart3, Edit, Trash2,
  AlertTriangle, CheckCircle2, Clock, RefreshCw, ShieldAlert, ArrowUpRight,
  ShieldCheck, FileText, CheckSquare
} from 'lucide-react';

export default function InspectionList() {
  const [inspections, setInspections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    projectApi.getAll().then(res => setProjects(res || [])).catch(console.error);
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [selectedProjectId, selectedStage, selectedStatus]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const data = await inspectionApi.getAll({
        projectId: selectedProjectId || undefined,
        stage: selectedStage || undefined,
        status: selectedStatus || undefined,
      });
      setInspections(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (selectedInspection) {
        await inspectionApi.update(selectedInspection.id, formData);
      } else {
        await inspectionApi.create(formData);
      }
      setIsModalOpen(false);
      setSelectedInspection(null);
      fetchInspections();
    } catch (err) {
      alert('Error saving inspection: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this inspection audit log entry?')) {
      try {
        await inspectionApi.delete(id);
        fetchInspections();
      } catch (err) {
        alert('Failed to delete inspection: ' + err.message);
      }
    }
  };

  const handleOpenReport = async () => {
    try {
      const data = await inspectionApi.getSummaryReport();
      setReportData(data);
      setIsReportOpen(true);
    } catch (err) {
      alert('Failed to generate quality report: ' + err.message);
    }
  };

  const totalCount = inspections.length;
  const passedCount = inspections.filter(i => i.status === 'PASSED').length;
  const failedCount = inspections.filter(i => i.status === 'FAILED').length;
  const reInspections = inspections.filter(i => i.isReInspection || i.status === 'RE_INSPECTION_SCHEDULED').length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100;

  const failedInspectionsList = inspections.filter(i => i.status === 'FAILED');

  const stageOverview = [
    { title: 'Foundation & Piling', count: '6 Audits', pass: '100% Compliant', icon: ShieldCheck, status: 'passed' },
    { title: 'Concrete Superstructure', count: '5 Audits', pass: '80% Compliant', icon: RefreshCw, status: 'warning' },
    { title: 'Electrical & Plumbing', count: '4 Audits', pass: '75% Compliant', icon: AlertTriangle, status: 'failed' },
    { title: 'Waterproofing Membrane', count: '3 Audits', pass: '100% Compliant', icon: CheckSquare, status: 'passed' },
  ];

  return (
    <div style={{ padding: '36px 48px' }}>
      {/* Header */}
      <div className="gsi-section-header" style={{ marginBottom: 36, borderBottom: '1px solid var(--border-light)', paddingBottom: 20 }}>
        <div>
          <h1 className="gsi-headline" style={{ fontSize: '2.2rem', margin: 0 }}>
            Quality Inspection <span>Management</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 6 }}>
            Site QA/QC audit checklists, defect logging, and automated re-inspection workflows.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <button className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={handleOpenReport}>
            <BarChart3 size={16} /> Quality & Defect Report
          </button>
          <button className="btn-gsi-gold" onClick={() => { setSelectedInspection(null); setIsModalOpen(true); }}>
            <Plus size={16} /> Schedule Inspection Audit
          </button>
        </div>
      </div>

      {/* Re-Inspection Alert Banner */}
      {failedInspectionsList.length > 0 && (
        <div style={{ padding: '18px 24px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <ShieldAlert size={28} color="var(--danger)" />
          <div>
            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.96rem' }}>
              Automated Re-Inspection Workflow Triggered ({failedInspectionsList.length} Open Defects)
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Failed inspection audits require re-examination: {failedInspectionsList.map(i => `${i.stage} (${i.project ? i.project.name : 'Site'})`).join(', ')}.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="stat-grid" style={{ gap: 24, marginBottom: 36 }}>
        <div className="stat-card">
          <span className="stat-title">Total Audits Logged</span>
          <span className="stat-value">{totalCount}</span>
          <span className="stat-desc">Recorded inspection stage gates</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Quality Pass Rate</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{passRate}%</span>
          <span className="stat-desc">{passedCount} audits passed compliance</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Open Defect Flags</span>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>{failedCount}</span>
          <span className="stat-desc">Requiring site corrective actions</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Re-Inspections Scheduled</span>
          <span className="stat-value" style={{ color: 'var(--gold-primary)' }}>{reInspections}</span>
          <span className="stat-desc">Auto-triggered follow-up audits</span>
        </div>
      </div>

      {/* Stage Compliance Overview Cards */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: 18 }}>
          Inspection Stage Gate Compliance
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {stageOverview.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div key={idx} className="stat-card" style={{ background: 'var(--bg-card)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${st.status}`}>{st.pass}</span>
                  <Icon size={20} color="var(--gold-primary)" />
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: 12 }}>
                  {st.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {st.count} logged
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar & Data Table */}
      <div className="table-card">
        <div className="table-toolbar" style={{ padding: '20px 28px' }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="select-input"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              className="select-input"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              <option value="">All Inspection Stages</option>
              <option value="EXCAVATION">Excavation & Soil</option>
              <option value="FOUNDATION">Foundation & Piling</option>
              <option value="CONCRETE_POURING">Concrete Pouring</option>
              <option value="STRUCTURAL_STEEL">Structural Steel</option>
              <option value="MASONRY_BRICKWORK">Masonry / Brickwork</option>
              <option value="PLUMBING">Plumbing Pressure Test</option>
              <option value="ELECTRICAL">Electrical Conduit & Wiring</option>
              <option value="WATERPROOFING">Waterproofing Membrane</option>
              <option value="FIRE_SAFETY">Fire Safety Compliance</option>
            </select>

            <select
              className="select-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Audit Results</option>
              <option value="PASSED">Passed Compliant</option>
              <option value="FAILED">Failed Defect</option>
              <option value="PENDING">Pending Audit</option>
              <option value="RE_INSPECTION_SCHEDULED">Re-Inspection Scheduled</option>
            </select>
          </div>

          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Showing {inspections.length} audit entries
          </span>
        </div>

        {error && (
          <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, margin: 20, color: 'var(--danger)', fontSize: '0.86rem' }}>
            <AlertTriangle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Data Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ padding: '16px 28px' }}>Site Construction Project</th>
                <th>Stage & Scope</th>
                <th>Inspector Name</th>
                <th>Audit Date</th>
                <th>Audit Result</th>
                <th>Checklist / Defect Notes</th>
                <th style={{ textAlign: 'right', paddingRight: 28 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>Loading quality inspection logs...</td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No inspection audits found matching current criteria.
                  </td>
                </tr>
              ) : (
                inspections.map((i) => (
                  <tr key={i.id} style={{ background: i.status === 'FAILED' ? 'rgba(239,68,68,0.06)' : undefined }}>
                    <td style={{ padding: '20px 28px' }}>
                      <strong style={{ color: '#ffffff', fontSize: '0.96rem' }}>{i.project ? i.project.name : 'Site'}</strong>
                      {i.isReInspection && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--gold-primary)', fontSize: '0.72rem', fontWeight: 800, marginLeft: 8 }}>
                          <RefreshCw size={11} /> Re-Inspection
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-ongoing">{i.stage}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{i.inspectorName}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{i.inspectionDate}</td>
                    <td>
                      <span className={`badge badge-${i.status.toLowerCase()}`}>
                        {i.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      {i.defectRemarks ? (
                        <div style={{ color: 'var(--danger)', fontSize: '0.78rem', fontWeight: 700 }}>
                          Defect: {i.defectRemarks}
                        </div>
                      ) : i.checklistNotes ? (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          {i.checklistNotes}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Passed Quality Check</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 28 }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setSelectedInspection(i); setIsModalOpen(true); }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(i.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InspectionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedInspection(null); }}
        onSave={handleCreateOrUpdate}
        inspection={selectedInspection}
        projects={projects}
      />

      <InspectionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportData={reportData}
      />
    </div>
  );
}
