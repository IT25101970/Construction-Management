import React, { useState, useEffect } from 'react';
import { projectApi } from '../../api/projectApi';
import {
  ArrowUpRight
} from 'lucide-react';

export default function DashboardView({ onNavigate }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.getSummaryReport()
      .then((data) => setReport(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalBudget = report ? report.totalEstimatedBudget : 0;
  const avgProgress = report ? report.averageProgressPercentage : 0;
  const ongoingCount = report ? report.ongoingCount : 0;

  if (loading) return <div className="content-area" role="status">Loading records...</div>;

  return (
    <div style={{ padding: '36px 48px' }}>
      {/* 1. GSI HERO BANNER */}
      <section className="gsi-hero" style={{ padding: '60px 36px 80px', borderRadius: 'var(--radius-lg)', marginBottom: 40 }}>
        <div className="gsi-hero-pretitle">Pioneering software solutions for</div>
        <h1 className="gsi-hero-title" style={{ fontSize: '3rem' }}>
          GSI <span>CONSTRUCTION MANAGEMENT</span>
        </h1>
        <p className="gsi-hero-desc">
          Unified site management platform consolidating all 6 major construction functions — project planning, quality control, task scheduling, inventory, workforce, and financial control.
        </p>
        <button className="btn-gsi-gold" onClick={() => onNavigate('projects')}>
          EXPLORE ACTIVE CONSTRUCTION SITES
        </button>
      </section>

      {/* 2. EXECUTIVE SITE KPI SUMMARY */}
      <div style={{ marginBottom: 40 }}>
        <div className="gsi-section-header" style={{ marginBottom: 20 }}>
          <h2 className="gsi-headline" style={{ fontSize: '1.8rem', margin: 0 }}>
            Site Operations <span>Control Summary</span>
          </h2>
          <button className="btn-gsi-gold" style={{ padding: '8px 20px', fontSize: '0.78rem' }} onClick={() => onNavigate('projects')}>
            + Register New Project
          </button>
        </div>

        <div className="stat-grid">
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('projects')}>
            <span className="stat-title">Active Construction Sites</span>
            <span className="stat-value">{report ? report.totalProjects : 0}</span>
            <span className="stat-desc">{ongoingCount} sites currently in progress</span>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('tasks')}>
            <span className="stat-title">Schedule Progress Index</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>{avgProgress}%</span>
            <span className="stat-desc">On schedule across active milestones</span>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('finance')}>
            <span className="stat-title">Total Project Value</span>
            <span className="stat-value" style={{ color: 'var(--gold-primary)' }}>
              Rs. {Number(totalBudget).toLocaleString()} LKR
            </span>
            <span className="stat-desc">Approved capital under management</span>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('inspections')}>
            <span className="stat-title">Quality Assurance Pass Rate</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>88%</span>
            <span className="stat-desc">Compliance on site audit gates</span>
          </div>
        </div>
      </div>


      {/* 4. ACTIVE SITES OVERVIEW TABLE */}
      {report && report.projects && (
        <div className="table-card" style={{ marginBottom: 48 }}>
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Active Construction Sites Snapshot</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Real-time synchronization across site planning and progress tracking</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('projects')}>
              View All Projects <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Site Name & Location</th>
                  <th>Client & Owner</th>
                  <th>Estimated Budget</th>
                  <th>Progress Completion</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {report.projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{p.name}</strong>
                      <br/>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.location}</span>
                    </td>
                    <td>{p.client}</td>
                    <td style={{ fontWeight: 800, color: 'var(--gold-primary)' }}>Rs. {Number(p.estimatedBudget).toLocaleString()} LKR</td>
                    <td style={{ minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-fill" style={{ width: `${p.progressPercentage}%` }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{p.progressPercentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('projects')}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. GSI FOOTER SECTION */}
      <footer className="gsi-footer" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="footer-main-grid">
          <div>
            <div className="footer-brand-box">
              GSI
              <span>CONSTRUCTION MANAGEMENT</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 300 }}>
              Pioneering software solutions for the construction industry. Enterprise 6-module construction management platform.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 800, marginBottom: 16 }}>SITE NAVIGATION</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
              <a className="topbar-link" onClick={() => onNavigate('projects')}>1. Project Planning</a>
              <a className="topbar-link" onClick={() => onNavigate('inspections')}>2. Quality Inspection</a>
              <a className="topbar-link" onClick={() => onNavigate('tasks')}>3. Task Scheduling</a>
              <a className="topbar-link" onClick={() => onNavigate('inventory')}>4. Material Inventory</a>
              <a className="topbar-link" onClick={() => onNavigate('workforce')}>5. Labour & Workforce</a>
              <a className="topbar-link" onClick={() => onNavigate('finance')}>6. Budget & Finance</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 800, marginBottom: 16 }}>GET IN TOUCH</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
              GSI Construction Management Platform. Designed for civil engineering projects and site automation.
            </p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>Copyright &copy; 2026 GSI Construction Management. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
