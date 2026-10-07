import { authApi } from '../../api/authApi';
import React, { useState } from 'react';
import {
  ShieldCheck, HardHat, Eye, Briefcase, User,
  ArrowRight
} from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState('USER'); // 'USER' or 'ADMIN'
  const [selectedRole, setSelectedRole] = useState('PM'); // PM, SUPERVISOR, CLIENT
  const [username, setUsername] = useState('pm_kamal');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'PM') setUsername('pm_kamal');
    else if (role === 'SUPERVISOR') setUsername('sup_perera');
    else if (role === 'CLIENT') setUsername('client_road_auth');
  };

  const handleTypeSelect = (type) => {
    setLoginType(type);
    setError('');
    if (type === 'ADMIN') {
      setUsername('admin_sys');
    } else {
      setSelectedRole('PM');
      setUsername('pm_kamal');
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const account = await authApi.login(username.trim(), password);
      onLogin(account);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b0d13',
      backgroundImage: 'radial-gradient(at 20% 20%, rgba(241, 245, 249, 0.12) 0px, transparent 40%), radial-gradient(at 80% 80%, rgba(255, 200, 0, 0.08) 0px, transparent 45%), linear-gradient(180deg, #181c2a 0%, #08090d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambient Silver & Gold Glows */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: '15%',
        width: 500,
        height: 500,
        background: 'rgba(226, 232, 240, 0.12)',
        filter: 'blur(130px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        width: 450,
        height: 450,
        background: 'rgba(255, 200, 0, 0.08)',
        filter: 'blur(120px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div className="login-card" style={{
        width: '100%',
        maxWidth: 1040,
        background: 'rgba(15, 17, 24, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-dark), 0 0 50px rgba(255, 200, 0, 0.12)',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Left Side: Skyscraper Backdrop & Value Highlights */}
        <div className="login-panel" style={{
          backgroundImage: 'linear-gradient(180deg, rgba(12, 14, 20, 0.75) 0%, rgba(8, 9, 12, 0.92) 100%), url(/images/skyscraper.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '56px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-light)'
        }}>
          <div>
            <div className="gsi-brand-box" style={{ marginBottom: 28 }}>
              GSI
              <span>CONSTRUCTION MANAGEMENT</span>
            </div>

            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.6rem', fontWeight: 900, lineHeight: 1.1, color: '#ffffff', marginBottom: 18, letterSpacing: '-0.02em' }}>
              GSI <span style={{ color: 'var(--gold-primary)' }}>Construction Management</span>
            </h1>

            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Consolidating all 6 core construction management modules into a unified 3-tier MVC framework with real-time site analytics and RBAC security.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid var(--border-light)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>GSI Construction Platform v3.0</span>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800 }}>Spring Boot + MySQL</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-panel" style={{ padding: '56px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#0f1118' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginBottom: 6 }}>
              Sign In to Platform
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Sign in with your registered account. Permissions come from your account.
            </p>
          </div>

          {/* Login Type Switcher (User vs Admin) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            background: '#08090c',
            padding: 4,
            borderRadius: 30,
            border: '1px solid var(--border-light)',
            marginBottom: 24
          }}>
            <button
              type="button"
              onClick={() => handleTypeSelect('USER')}
              style={{
                padding: '10px 16px',
                borderRadius: 24,
                border: 'none',
                background: loginType === 'USER' ? 'var(--gold-gradient)' : 'transparent',
                color: loginType === 'USER' ? '#000000' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: loginType === 'USER' ? 'var(--gold-glow)' : 'none',
                transition: 'all 0.25s'
              }}
            >
              <User size={14} /> User Login
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect('ADMIN')}
              style={{
                padding: '10px 16px',
                borderRadius: 24,
                border: 'none',
                background: loginType === 'ADMIN' ? 'var(--gold-gradient)' : 'transparent',
                color: loginType === 'ADMIN' ? '#000000' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: loginType === 'ADMIN' ? 'var(--gold-glow)' : 'none',
                transition: 'all 0.25s'
              }}
            >
              <ShieldCheck size={14} /> Admin Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* User Persona Selector */}
            {loginType === 'USER' && (
              <div className="form-group">
                <label className="form-label">Account shortcut</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { id: 'PM', label: 'PM', icon: Briefcase },
                    { id: 'SUPERVISOR', label: 'Supervisor', icon: HardHat },
                    { id: 'CLIENT', label: 'Client', icon: Eye },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleSelect(r.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
                          background: isSelected ? 'var(--gold-light-bg)' : '#141620',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Icon size={13} color={isSelected ? 'var(--gold-primary)' : 'var(--text-muted)'} />
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin Info Badge */}
            {loginType === 'ADMIN' && (
              <div style={{
                padding: '12px 16px',
                background: 'var(--gold-light-bg)',
                border: '1px solid var(--gold-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: '#ffffff'
              }}>
                <strong style={{ color: 'var(--gold-primary)' }}>System Admin Credentials:</strong> Access user management, security configurations, and platform audit logs.
              </div>
            )}

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

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.78rem', fontWeight: 700 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-gsi-gold"
              style={{
                borderRadius: 30,
                width: '100%',
                padding: '14px',
                marginTop: 6
              }}
            >
              Sign In to {loginType === 'ADMIN' ? 'Admin Portal' : 'Workspace'} <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
