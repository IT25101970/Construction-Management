import React from 'react';
import {
  Building2, CheckSquare, ClipboardCheck, Package, Users,
  Wallet, LayoutDashboard, ExternalLink, HardHat, Settings, LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, currentRole, onLogout }) {
  // Navigation tabs for regular users
  const userNavItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, tag: 'Overview' },
    { id: 'projects', label: '1. Project Planning', icon: Building2, tag: 'F1' },
    { id: 'inspections', label: '2. Quality Inspection', icon: ClipboardCheck, tag: 'F2' },
    { id: 'tasks', label: '3. Task Scheduling', icon: CheckSquare, tag: 'F3' },
    { id: 'inventory', label: '4. Material & Inventory', icon: Package, tag: 'F4' },
    { id: 'workforce', label: '5. Labour & Workforce', icon: Users, tag: 'F5' },
    { id: 'finance', label: '6. Budget & Finance', icon: Wallet, tag: 'F6' },
  ];

  if (currentRole === 'CLIENT') {
    userNavItems.push({ id: 'client-portal', label: 'Client Progress Portal', icon: ExternalLink, tag: 'Client' });
  }

  // Navigation tabs for Admin Portal
  const adminNavItems = [
    { id: 'admin-users', label: 'User Accounts Directory', icon: Users, tag: 'RBAC' },
    { id: 'admin-matrix', label: 'Permission Matrix', icon: Settings, tag: 'Security' },
    { id: 'admin-projects', label: 'Global Projects Control', icon: Building2, tag: 'Override' },
  ];

  const items = currentRole === 'ADMIN' ? adminNavItems : userNavItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">
          <HardHat size={22} />
        </div>
        <div>
          <div className="brand-title">BuildTrack GSI</div>
          <div className="brand-subtitle">{currentRole === 'ADMIN' ? 'Admin Security Portal' : 'Site Operations Suite'}</div>
        </div>
      </div>

      <nav className="nav-links">
        <div style={{ padding: '6px 12px 10px', fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {currentRole === 'ADMIN' ? 'System Administration' : 'Core Site Operations'}
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (currentRole === 'ADMIN' && activeTab === 'admin');
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--gold-primary)' : 'var(--text-secondary)' }} />
              <span>{item.label}</span>
              <span className="nav-badge" style={{ background: isActive ? 'var(--gold-light)' : undefined, color: isActive ? 'var(--gold-primary)' : undefined }}>
                {item.tag}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Role / Log Out Box */}
      <div style={{ padding: '16px', margin: '14px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
        <div style={{ color: 'var(--gold-primary)', fontWeight: 800, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Active Role Persona
        </div>
        <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: 10 }}>
          {currentRole}
        </div>
        <button
          className="btn btn-danger btn-sm"
          style={{ width: '100%', justifyContent: 'center', borderRadius: 4 }}
          onClick={onLogout}
        >
          <LogOut size={13} /> Log Out
        </button>
      </div>
    </aside>
  );
}
