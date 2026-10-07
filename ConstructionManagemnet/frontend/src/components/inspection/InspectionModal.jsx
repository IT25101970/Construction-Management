import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function InspectionModal({ isOpen, onClose, onSave, inspection, projects }) {
  const [formData, setFormData] = useState({
    projectId: '',
    stage: 'FOUNDATION',
    inspectorName: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    checklistNotes: '',
    defectRemarks: '',
    correctiveActionNotes: '',
    followUpDate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (inspection) {
      setFormData({
        projectId: inspection.project ? inspection.project.id : '',
        stage: inspection.stage || 'FOUNDATION',
        inspectorName: inspection.inspectorName || '',
        inspectionDate: inspection.inspectionDate || '',
        status: inspection.status || 'PENDING',
        checklistNotes: inspection.checklistNotes || '',
        defectRemarks: inspection.defectRemarks || '',
        correctiveActionNotes: inspection.correctiveActionNotes || '',
        followUpDate: inspection.followUpDate || '',
      });
    } else {
      setFormData({
        projectId: projects && projects.length > 0 ? projects[0].id : '',
        stage: 'FOUNDATION',
        inspectorName: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        checklistNotes: '',
        defectRemarks: '',
        correctiveActionNotes: '',
        followUpDate: '',
      });
    }
    setErrors({});
  }, [inspection, isOpen, projects]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.projectId) errs.projectId = 'Project selection is required';
    if (!formData.inspectorName.trim()) errs.inspectorName = 'Inspector name is required';
    if (!formData.inspectionDate) errs.inspectionDate = 'Inspection date is required';
    if (formData.status === 'FAILED' && !formData.defectRemarks.trim()) {
      errs.defectRemarks = 'Defect remarks are mandatory when status is FAILED';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...formData,
      projectId: Number(formData.projectId),
      followUpDate: formData.followUpDate || null,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{inspection ? 'Edit Quality Inspection' : 'Schedule Site Quality Inspection'}</h3>
            <p className="page-subtitle">Member 2 (F1b) &bull; Audit checklist & Defect logging</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Linked Project *</label>
              <select
                className="form-select"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="">-- Choose Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                ))}
              </select>
              {errors.projectId && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.projectId}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Inspection Stage *</label>
                <select
                  className="form-select"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                >
                  <option value="EXCAVATION">Excavation & Soil</option>
                  <option value="FOUNDATION">Foundation & Piling</option>
                  <option value="CONCRETE_POURING">Concrete Pouring</option>
                  <option value="STRUCTURAL_STEEL">Structural Steel</option>
                  <option value="MASONRY_BRICKWORK">Masonry / Brickwork</option>
                  <option value="PLUMBING">Plumbing Pressure Test</option>
                  <option value="ELECTRICAL">Electrical Conduit & Wiring</option>
                  <option value="WATERPROOFING">Waterproofing Membrane</option>
                  <option value="FIRE_SAFETY">Fire Safety Compliance</option>
                  <option value="INTERIOR_FINISHING">Interior Finishing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Inspector Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Eng. K. Wijesinghe (QA/QC)"
                  value={formData.inspectorName}
                  onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                />
                {errors.inspectorName && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.inspectorName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Inspection Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.inspectionDate}
                  onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                />
                {errors.inspectionDate && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.inspectionDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Audit Result / Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PENDING">Pending Audit</option>
                  <option value="PASSED">Passed (Compliant)</option>
                  <option value="FAILED">Failed (Defects Detected)</option>
                </select>
              </div>
            </div>

            {formData.status === 'FAILED' && (
              <div className="alert-box alert-danger" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                  <ShieldAlert size={18} /> Automated Re-Inspection Workflow Trigger
                </div>
                <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                  Marking this audit as <strong>FAILED</strong> will automatically schedule a linked follow-up re-inspection task and flag open non-conformances.
                </div>
                <div className="form-group" style={{ width: '100%', marginTop: 8 }}>
                  <label className="form-label" style={{ color: '#991b1b' }}>Proposed Follow-Up Re-Inspection Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Audit Checklist Findings</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Slump test results, rebar clearance, curing duration..."
                value={formData.checklistNotes}
                onChange={(e) => setFormData({ ...formData, checklistNotes: e.target.value })}
              />
            </div>

            {formData.status === 'FAILED' && (
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--danger)' }}>Defect Remarks *</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Describe non-conforming dimensions, honeycomb patches, incorrect rebar gauge..."
                  value={formData.defectRemarks}
                  onChange={(e) => setFormData({ ...formData, defectRemarks: e.target.value })}
                />
                {errors.defectRemarks && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.defectRemarks}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Corrective Action Notes</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Remediation instructions issued to site team..."
                value={formData.correctiveActionNotes}
                onChange={(e) => setFormData({ ...formData, correctiveActionNotes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{inspection ? 'Update Audit' : 'Save Inspection'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
