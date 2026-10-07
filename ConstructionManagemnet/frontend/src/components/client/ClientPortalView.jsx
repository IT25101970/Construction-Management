import React, { useState, useEffect } from 'react';
import { projectApi } from '../../api/projectApi';
import { CheckCircle2, Clock } from 'lucide-react';

export default function ClientPortalView() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.getAll()
      .then((data) => {
        setProjects(data || []);
        if (data && data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      })
      .catch(error => alert(error.message))
      .finally(() => setLoading(false));
  }, []);

  const currentProject = projects.find(p => p.id === Number(selectedProjectId));
  const milestones = currentProject && currentProject.milestones ? currentProject.milestones.filter(m => !m.isDeleted) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dedicated Client Transparency Portal</h1>
          <p className="page-subtitle">Read-only real-time tracking for project investors and clients (FR8)</p>
        </div>
        <div>
          <span className="badge badge-ongoing" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            Read-Only Client Session
          </span>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="table-card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Select Your Active Contract:</span>
        <select
          className="select-input"
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          style={{ minWidth: 300 }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.client})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading client portfolio data...</div>
      ) : currentProject ? (
        <div>
          {/* Overview Banner */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{currentProject.name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
                  Site Location: <strong>{currentProject.location}</strong> &bull; Client Registered: <strong>{currentProject.client}</strong>
                </p>
                <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                  Contract Timeline: <strong>{currentProject.startDate}</strong> to <strong>{currentProject.endDate}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-${currentProject.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  {currentProject.status}
                </span>
                <div style={{ marginTop: 8, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {currentProject.progressPercentage}% Completed
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="progress-bar-wrap" style={{ height: 12 }}>
                <div className="progress-bar-fill" style={{ width: `${currentProject.progressPercentage}%` }} />
              </div>
            </div>

            {currentProject.description && (
              <p style={{ marginTop: 16, fontSize: '0.88rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: 12, borderRadius: 8 }}>
                {currentProject.description}
              </p>
            )}
          </div>

          {/* Milestone Deliverables Checklist */}
          <div className="table-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
              Milestone Completion Deliverables
            </h3>
            {milestones.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No milestones currently published for this contract.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: m.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {m.status === 'COMPLETED' ? (
                        <CheckCircle2 size={24} color="var(--success)" />
                      ) : (
                        <Clock size={24} color="#94a3b8" />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>{m.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Target Date: {m.targetDate} {m.description && `• ${m.description}`}
                        </div>
                      </div>
                    </div>

                    <span className={`badge badge-${m.status.toLowerCase()}`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
