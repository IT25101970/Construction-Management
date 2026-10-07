import React from 'react';
import { User, LogOut, ShieldCheck, HardHat, Eye, Briefcase, Settings } from 'lucide-react';

export default function Navbar({ currentRole, onNavigate, activeTab, currentUser, onLogout }) {
  // Navigation tabs with short clean names
  let navTabs = [];

  if (activeTab === 'admin') {
    // Hide HOME, PLANNING, INSPECTIONS, TASKS, INVENTORY, WORKFORCE, BUDGET on admin page
    navTabs = [
      { id: 'admin', label: 'ADMIN CONSOLE' },
      { id: 'dashboard', label: '← MAIN SYSTEM' }
    ];
  } else {
    navTabs = [
      { id: 'dashboard', label: 'HOME' },
      { id: 'projects', label: 'PLANNING' },
      { id: 'inspections', label: 'INSPECTIONS' },
      { id: 'tasks', label: 'TASKS' },
      { id: 'inventory', label: 'INVENTORY' },
      { id: 'workforce', label: 'WORKFORCE' },
      { id: 'finance', label: 'BUDGET' },
    ];

    if (currentRole === 'CLIENT') {
      navTabs.push({ id: 'client-portal', label: 'CLIENT PORTAL' });
    }

    if (currentRole === 'ADMIN') {
      navTabs.push({ id: 'admin', label: 'ADMIN CONSOLE' });
    }
  }

  // Format clean display name without redundant (PM) / (Supervisor) text
  const rawName = currentUser ? currentUser.fullName : 'System User';
  const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();

  return (
    <header className="topbar">
      {/* Sleek Compact GSI Brand Box Logo */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        onClick={() => onNavigate && onNavigate('dashboard')}
      >
        <div className="gsi-brand-box">
          GSI
          <span>CONSTRUCTION MANAGEMENT</span>
        </div>
      </div>

      {/* Top Bar Navigation Items with Short Names */}
      <div className="topbar-nav">
        {navTabs.map((tab) => (
          <a
            key={tab.id}
            className={`topbar-link ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate(tab.id)}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* User Profile Badge & Logout */}
      <div className="topbar-actions">
        {/* User Info Badge */}
        <div className="user-profile-badge">
          <div className="user-avatar-circle">
            <User size={14} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="user-name-text">{cleanName}</span>
            <span className="role-pill-compact">{currentRole}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          className="btn btn-danger btn-sm" 
          style={{ 
            borderRadius: 16, 
            padding: '6px 14px', 
            fontSize: '0.76rem', 
            fontWeight: 800,
            background: '#ef4444', 
            color: '#ffffff',
            boxShadow: '0 2px 10px rgba(239, 68, 68, 0.45)',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={onLogout}
          title="Log Out of System"
        >
          <LogOut size={13} color="#ffffff" /> Log Out
        </button>
      </div>
    </header>
  );
}
