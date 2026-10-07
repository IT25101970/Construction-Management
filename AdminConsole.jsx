import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { 
  ShieldCheck, UserPlus, ToggleLeft, ToggleRight, Trash2, Edit3, 
  Key, UserCheck, Lock, Search, RefreshCw, CheckCircle2, Shield
} from 'lucide-react';

export default function AdminConsole() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'PM',
    password: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    userApi.getAllUsers()
      .then((data) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleToggleStatus = async (id) => {
    try {
      await userApi.toggleStatus(id);
      loadData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate and remove this user account?')) {
      try {
        await userApi.deleteUser(id);
        loadData();
      } catch (err) {
        console.error('Failed to delete user:', err);
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userApi.updateUser(editingUser.id, formData);
      } else {
        await userApi.createUser(formData);
      }
      loadData();
    } catch (err) {
      console.error('Failed to save user:', err);
      if (editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      } else {
        const newUser = {
          id: Date.now(),
          ...formData,
          lastLogin: 'Never',
          createdAt: new Date().toISOString().split('T')[0]
        };
        setUsers(prev => [newUser, ...prev]);
      }
    }
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({ username: '', fullName: '', email: '', role: 'PM', password: '', status: 'ACTIVE' });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          u.username.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ padding: '36px 48px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="gsi-section-header" style={{ marginBottom: 32, borderBottom: '1px solid var(--border-color)', paddingBottom: 20 }}>
        <div>
          <h1 className="gsi-headline" style={{ fontSize: '2.2rem', margin: 0 }}>
            System Admin <span>Console</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 6 }}>
            Manage user accounts, assign role permissions (RBAC), and review platform audit trails.
          </p>
        </div>
        <button className="btn-gsi-gold" onClick={() => { setEditingUser(null); setFormData({ username: '', fullName: '', email: '', role: 'PM', password: '', status: 'ACTIVE' }); setShowAddModal(true); }}>
          <UserPlus size={16} /> Create User Account
        </button>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="table-card" style={{ padding: 28, marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={20} color="var(--gold-primary)" /> Role-Based Access Control (RBAC) Permission Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ padding: 14, background: 'var(--bg-main)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
            <span className="badge badge-ongoing" style={{ background: 'var(--gold-light)', color: 'var(--gold-primary)' }}>Admin</span>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginTop: 8 }}>Full Platform Control</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>User creation, security configuration, role assignments, full system audit logs.</div>
          </div>
          <div style={{ padding: 14, background: 'var(--bg-main)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
            <span className="badge badge-ongoing">Project Manager</span>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginTop: 8 }}>Project & Financial Control</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Project Planning, Budget & Expense control, milestone setup, summary reports.</div>
          </div>
          <div style={{ padding: 14, background: 'var(--bg-main)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
            <span className="badge badge-passed">Site Supervisor</span>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginTop: 8 }}>Site Operations & Quality</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Task Scheduling, Material Stock, Worker Attendance, Quality Audits.</div>
          </div>
          <div style={{ padding: 14, background: 'var(--bg-main)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
            <span className="badge badge-planned">Client</span>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginTop: 8 }}>Read-Only Progress Portal</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Transparent read-only view of site milestones, progress completion, and deliverable certificates.</div>
          </div>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search user by name, username, email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PM">Project Manager</option>
              <option value="SUPERVISOR">Site Supervisor</option>
              <option value="CLIENT">Client</option>
            </select>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {filteredUsers.length} user accounts
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User Credentials</th>
                <th>Email Address</th>
                <th>Role Assignment</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Account Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong style={{ color: '#ffffff' }}>{u.fullName}</strong>
                    <br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)' }}>@{u.username}</span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-ongoing" style={{ background: u.role === 'ADMIN' ? 'var(--gold-light)' : undefined, color: u.role === 'ADMIN' ? 'var(--gold-primary)' : undefined }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.status === 'ACTIVE' ? 'passed' : 'failed'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.lastLogin}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleToggleStatus(u.id)}
                        title="Toggle Account Activation"
                      >
                        {u.status === 'ACTIVE' ? <ToggleRight size={14} color="var(--success)" /> : <ToggleLeft size={14} color="var(--danger)" />}
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => { setEditingUser(u); setFormData(u); setShowAddModal(true); }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Create/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? 'Edit User Account' : 'Create New System User'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role Assignment *</label>
                    <select 
                      className="form-select" 
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="ADMIN">Admin (Full System Control)</option>
                      <option value="PM">Project Manager (Planning & Budget)</option>
                      <option value="SUPERVISOR">Site Supervisor (Tasks, Stock, Attendance)</option>
                      <option value="CLIENT">Client (Read-Only Portal)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep existing password' : 'Enter secure password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-gsi-gold" style={{ padding: '8px 24px', borderRadius: 4, fontSize: '0.82rem' }}>
                  {editingUser ? 'Update Account' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
