import React, { useState, useEffect } from 'react';
import { projectApi } from '../../api/projectApi';
import ProjectModal from './ProjectModal';
import MilestoneModal from './MilestoneModal';
import ProjectReportModal from './ProjectReportModal';
import {
  Plus, Search, Filter, Layers, Archive, Trash2, Edit, FileText,
  Flag, Building2, Calendar, Wallet, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestoneProject, setMilestoneProject] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [searchKeyword, clientFilter, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll({
        keyword: searchKeyword,
        client: clientFilter,
        status: statusFilter || undefined,
      });
      setProjects(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (projectData) => {
    try {
      if (selectedProject) {
        await projectApi.update(selectedProject.id, projectData);
      } else {
        await projectApi.create(projectData);
      }
      setIsModalOpen(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      alert('Error saving project: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to soft-delete this project? Historical milestone and task records will be preserved.')) {
      try {
        await projectApi.delete(id);
        fetchProjects();
      } catch (err) {
        alert('Failed to delete project: ' + err.message);
      }
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Archive this completed or closed project?')) {
      try {
        await projectApi.archive(id);
        fetchProjects();
      } catch (err) {
        alert('Failed to archive project: ' + err.message);
      }
    }
  };

  const handleAddMilestone = async (projectId, milestoneData) => {
    try {
      await projectApi.addMilestone(projectId, milestoneData);
      const updated = await projectApi.getById(projectId);
      setMilestoneProject(updated);
      fetchProjects();
    } catch (err) {
      alert('Failed to add milestone: ' + err.message);
    }
  };

  const handleUpdateMilestone = async (milestoneId, milestoneData) => {
    try {
      await projectApi.updateMilestone(milestoneId, milestoneData);
      if (milestoneProject) {
        const updated = await projectApi.getById(milestoneProject.id);
        setMilestoneProject(updated);
      }
      fetchProjects();
    } catch (err) {
      alert('Failed to update milestone: ' + err.message);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await projectApi.deleteMilestone(milestoneId);
      if (milestoneProject) {
        const updated = await projectApi.getById(milestoneProject.id);
        setMilestoneProject(updated);
      }
      fetchProjects();
    } catch (err) {
      alert('Failed to remove milestone: ' + err.message);
    }
  };

  const handleOpenReport = async () => {
    try {
      const data = await projectApi.getSummaryReport();
      setReportData(data);
      setIsReportOpen(true);
    } catch (err) {
      alert('Failed to generate report: ' + err.message);
    }
  };

  // KPIs
  const totalCount = projects.length;
  const ongoingCount = projects.filter(p => p.status === 'ONGOING').length;
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.estimatedBudget || 0), 0);

  return (
    <div style={{ padding: '36px 48px' }}>
      {/* Page Header */}
      <div className="gsi-section-header" style={{ marginBottom: 36, borderBottom: '1px solid var(--border-light)', paddingBottom: 20 }}>
        <div>
          <h1 className="gsi-headline" style={{ fontSize: '2.2rem', margin: 0 }}>
            Project Planning & <span>Control</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 6 }}>
            Master project lifecycles, milestone schedules, location parameters, and overall progress completion.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <button className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={handleOpenReport}>
            <FileText size={16} /> Summary Report
          </button>
          <button className="btn-gsi-gold" onClick={() => { setSelectedProject(null); setIsModalOpen(true); }}>
            <Plus size={16} /> Register Project
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stat-grid" style={{ gap: 24, marginBottom: 36 }}>
        <div className="stat-card">
          <span className="stat-title">Active Portfolios</span>
          <span className="stat-value">{totalCount}</span>
          <span className="stat-desc">{ongoingCount} sites actively under construction</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Ongoing Sites</span>
          <span className="stat-value" style={{ color: 'var(--gold-primary)' }}>{ongoingCount}</span>
          <span className="stat-desc">Executing scheduled phases</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Completed Projects</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{completedCount}</span>
          <span className="stat-desc">Ready for client handover</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Total Allocated Budget</span>
          <span className="stat-value">Rs. {totalBudget.toLocaleString()} LKR</span>
          <span className="stat-desc">Cumulative contract values</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="table-card">
        <div className="table-toolbar" style={{ padding: '20px 28px' }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="search-input"
              style={{ minWidth: 260 }}
              placeholder="Search by project name or site location..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <input
              type="text"
              className="search-input"
              style={{ minWidth: 200 }}
              placeholder="Filter by Client..."
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
            <select
              className="select-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="ONGOING">Ongoing</option>
              <option value="ON_HOLD">On-Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {error && (
          <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, margin: 20, color: 'var(--danger)', fontSize: '0.86rem' }}>
            <AlertTriangle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Table View */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ padding: '16px 28px' }}>Project Name & Location</th>
                <th>Client & Owner</th>
                <th>Timeline</th>
                <th>Estimated Budget</th>
                <th>Milestones & Completion</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: 28 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                    Loading project portfolios...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No construction projects found matching current criteria.
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const milestones = p.milestones ? p.milestones.filter(m => !m.isDeleted) : [];
                  const completedMilestones = milestones.filter(m => m.status === 'COMPLETED').length;

                  return (
                    <tr key={p.id}>
                      <td style={{ padding: '20px 28px' }}>
                        <strong style={{ fontSize: '0.98rem', color: '#ffffff' }}>{p.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {p.location}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{p.client}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Registered Client</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{p.startDate} &rarr; {p.endDate}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '0.98rem' }}>
                          Rs. {Number(p.estimatedBudget).toLocaleString()} LKR
                        </span>
                      </td>
                      <td style={{ minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-fill" style={{ width: `${p.progressPercentage}%` }} />
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{p.progressPercentage}%</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {completedMilestones} of {milestones.length} milestones complete
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: 28 }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Manage Milestones"
                            onClick={() => setMilestoneProject(p)}
                          >
                            <Flag size={14} /> Milestones
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Project"
                            onClick={() => { setSelectedProject(p); setIsModalOpen(true); }}
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Archive Project"
                            onClick={() => handleArchive(p.id)}
                          >
                            <Archive size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Soft Delete"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
        onSave={handleCreateOrUpdate}
        project={selectedProject}
      />

      <MilestoneModal
        isOpen={!!milestoneProject}
        onClose={() => setMilestoneProject(null)}
        project={milestoneProject}
        onAddMilestone={handleAddMilestone}
        onUpdateMilestone={handleUpdateMilestone}
        onDeleteMilestone={handleDeleteMilestone}
      />

      <ProjectReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportData={reportData}
      />
    </div>
  );
}
