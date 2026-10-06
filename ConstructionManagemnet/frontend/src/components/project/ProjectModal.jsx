import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ProjectModal({ isOpen, onClose, onSave, project }) {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    estimatedBudget: '',
    status: 'PLANNED',
    progressPercentage: 0,
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        client: project.client || '',
        location: project.location || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        estimatedBudget: project.estimatedBudget || '',
        status: project.status || 'PLANNED',
        progressPercentage: project.progressPercentage || 0,
        description: project.description || '',
      });
    } else {
      setFormData({
        name: '',
        client: '',
        location: '',
        startDate: '',
        endDate: '',
        estimatedBudget: '',
        status: 'PLANNED',
        progressPercentage: 0,
        description: '',
      });
    }
    setErrors({});
  }, [project, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Project name is required';
    if (!formData.client.trim()) errs.client = 'Client name is required';
    if (!formData.location.trim()) errs.location = 'Site location is required';
    if (!formData.startDate) errs.startDate = 'Start date is required';
    if (!formData.endDate) errs.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errs.endDate = 'End date must be after start date';
    }
    if (!formData.estimatedBudget || Number(formData.estimatedBudget) <= 0) {
      errs.estimatedBudget = 'Budget must be greater than zero';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...formData,
      estimatedBudget: Number(formData.estimatedBudget),
      progressPercentage: Number(formData.progressPercentage),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">{project ? 'Edit Construction Project' : 'Register New Project'}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Lotus Horizon Commercial Complex"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Client Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex Residencies Ltd"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                />
                {errors.client && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.client}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Site Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Colombo 03, Sri Lanka"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                {errors.location && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.location}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                {errors.startDate && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Target Completion Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                {errors.endDate && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.endDate}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Estimated Budget (LKR) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="e.g. 25000000"
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                />
                {errors.estimatedBudget && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.estimatedBudget}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Project Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PLANNED">Planned</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="ON_HOLD">On-Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Progress (%): {formData.progressPercentage}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progressPercentage}
                onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Description & Scope Details</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="High level overview of architectural specifications, piling, foundation, structural layout..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{project ? 'Update Project' : 'Register Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
