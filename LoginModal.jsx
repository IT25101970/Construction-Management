import React, { useState } from 'react';
import { Lock, UserCheck, ShieldCheck, HardHat, Eye, Briefcase, Key } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLogin, currentRole }) {
  const [selectedRole, setSelectedRole] = useState(currentRole || 'PM');
  const [username, setUsername] = useState('admin_sys');
  const [password, setPassword] = useState('••••••••');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(selectedRole, username);
    onClose();
  };

  const roleDescriptions = {
    ADMIN: 'Full Platform Control & Admin Console user management.',
    PM: 'Project Planning & Control (F1a) + Financial Budget Ledger (F6).',
    SUPERVISOR: 'Daily Task Scheduling (F2), Material Inventory (F3), Labour (F4), Inspections (F1b).',
    CLIENT: 'Dedicated Read-Only Progress Portal for milestone tracking & deliverables.'
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="logo-badge" style={{ width: 34, height: 34 }}>
              <Lock size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '1.1rem' }}>User Authentication</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Sign in to access your role-based workspace</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Select Role Persona */}
            <div className="form-group">
              <label className="form-label">Select User Role (RBAC) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { id: 'ADMIN', label: 'Admin', icon: ShieldCheck },
                  { id: 'PM', label: 'Project Manager', icon: Briefcase },
                  { id: 'SUPERVISOR', label: 'Site Supervisor', icon: HardHat },
                  { id: 'CLIENT', label: 'Client (Read-Only)', icon: Eye },
                ].map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--gold-light)' : 'var(--bg-main)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Icon size={14} color={isSelected ? 'var(--gold-primary)' : 'var(--text-muted)'} />
                      {r.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginTop: 8, background: 'rgba(245, 184, 0, 0.08)', padding: '8px 12px', borderRadius: 4, border: '1px solid rgba(245, 184, 0, 0.2)' }}>
                <strong>Role Scope:</strong> {roleDescriptions[selectedRole]}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Username / Email *</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input 
                type="password" 
                className="form-input" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-gsi-gold" style={{ padding: '9px 24px', borderRadius: 4, fontSize: '0.82rem' }}>
              Sign In to Platform
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
